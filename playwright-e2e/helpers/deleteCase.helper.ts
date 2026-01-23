/**
 * Case cleanup helpers
 * --------------------
 * These helpers are responsible for reliably deleting cases created during
 * E2E test execution.
 *
 * IMPORTANT:
 * Case deletion via the UI has historically been extremely flaky due to:
 *  - unstable confirmation dialogs
 *
 * As a result, deletion logic is intentionally defensive and retry-based.
 * Any apparent redundancy is deliberate and should not be simplified
 * without re-validating stability in CI in the future.
 */

import { config } from "../utils";
import { chromium, Page, BrowserContext } from "playwright";
import { expect } from "../fixtures";
import { todaysDate } from "../utils";
import CaseSearchPage from "../page-objects/pages/case/caseSearch.page";
import CaseDetailsPage from "../page-objects/pages/case/caseDetails.page";

/**
 * Executes a cleanup function without allowing failures to break the test run.
 *
 * Cleanup is best-effort only:
 *  - failures are logged, not thrown
 *  - timeouts are reported but do not fail the suite
 *
 * This prevents test flakiness caused by post-test teardown issues.
 */
export async function runCleanupSafely(
  fn: () => Promise<void>,
  timeoutMs: number,
) {
  let finished = false;

  const timeout = setTimeout(() => {
    if (!finished) {
      console.warn(`⚠️ Cleanup timed out after ${timeoutMs}ms`);
    }
  }, timeoutMs);

  try {
    await fn();
  } catch (err) {
    console.warn(`⚠️ Cleanup failed:`, err);
  } finally {
    finished = true;
    clearTimeout(timeout);
  }
}

/**
 * Executes an operation as an Admin user in an isolated browser context.
 *
 * A fresh browser and storage state are used to avoid:
 *  - session contamination from test users
 *  - permission-related failures during cleanup
 */
export async function runAsAdmin(
  callback: (page: Page) => Promise<void>,
  headed = true,
) {
  let context: BrowserContext | null = null;

  try {
    const browser = await chromium.launch({ headless: headed });

    context = await browser.newContext({
      storageState: config.users.admin.sessionFile,
    });

    const page = await context.newPage();
    await callback(page);

    await context.close();
    await browser.close();
  } catch (err) {
    if (context) await context.close();
    console.error("❌ runAsAdmin failed:", err);
    throw err;
  }
}

/**
 * Deletes a case by name using the Admin UI.
 *
 * This helper intentionally uses polling and repeated validation because:
 *  - the delete confirmation dialog is unreliable
 *  - the case may already have been deleted by a previous attempt
 *  - search results may lag behind actual deletion
 *
 * Behaviour:
 *  - treats "case not found" as success
 *  - retries deletion until confirmed or timeout reached
 *  - validates deletion via search rather than UI feedback alone
 */

export async function deleteCaseByName(caseName: string, timeoutMs = 60000) {
  if (!caseName) return;

  await runAsAdmin(async (page) => {
    const caseSearchPage = new CaseSearchPage(page);
    const caseDetailsPage = new CaseDetailsPage(page);

    await expect
      .poll(
        async () => {
          await page.goto(
            `${config.urls.base}Case/CaseIndex?currentFirst=1&displaySize=10`,
          );

          let caseExists = true;

          try {
            // If the case cannot be found, consider it already deleted
            await caseSearchPage.searchCaseFile(
              caseName,
              "Southwark",
              todaysDate(),
            );
          } catch {
            caseExists = false;
          }

          if (!caseExists) return true; // already deleted

          const onUpdatePage = await caseSearchPage.goToUpdateCase(
            caseName,
            todaysDate(),
          );
          if (!onUpdatePage) return true; // already deleted

          // Perform deletion
          await caseDetailsPage.removeCase(timeoutMs);

          // Confirm deletion succeeded
          return await caseSearchPage.confirmCaseDeletion();
        },
        { timeout: timeoutMs, intervals: [500, 1000, 1500] },
      )
      .toBe(true);
  });
  console.log(`Successfully deleted ${caseName}`);
}
