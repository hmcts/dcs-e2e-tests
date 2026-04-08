import { config } from "../utils";
import { chromium, Page, BrowserContext } from "playwright";
import { todaysDate } from "../utils";
import CaseSearchPage from "../page-objects/pages/case/caseSearch.page";
import CaseDetailsPage from "../page-objects/pages/case/caseDetails.page";
/**
 * Case cleanup helpers
 * --------------------
 * These helpers are responsible for reliably deleting cases created during
 * E2E test execution.
 */

/**
 * Executes a cleanup function without allowing failures to break the test run.
 *
 * Cleanup is best-effort only:
 *  - failure is logged, not thrown
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
  } catch {
    console.warn(`⚠️ Cleanup failed`);
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
): Promise<boolean> {
  let context: BrowserContext | null = null;

  try {
    const browser = await chromium.launch({ headless: headed });

    context = await browser.newContext({
      storageState: config.users.admin.sessionFile,
    });

    const page = await context.newPage();
    try {
      await callback(page);
      return true;
    } catch (cbErr) {
      console.error("❌ An action within the cleanup process failed:", cbErr);
      return false;
    } finally {
      if (context) await context.close();
      await browser.close();
    }
  } catch (err) {
    console.error(
      "❌ Failed to launch browser or create context for runAsAdmin:",
      err,
    );
    return false;
  }
}

export async function deleteCaseByName(caseName: string, timeoutMs = 60000) {
  if (!caseName) return;

  const success = await runAsAdmin(async (page) => {
    const caseSearchPage = new CaseSearchPage(page);
    const caseDetailsPage = new CaseDetailsPage(page);

    await page.goto(
      `${config.urls.base}Case/CaseIndex?currentFirst=1&displaySize=10`,
    );

    // The methods called here (searchCaseFile, goToUpdateCase, removeCase, confirmCaseDeletion)
    // are expected to handle their own errors gracefully by logging and not throwing,
    // and runAsAdmin's inner catch block will log their errors.
    await caseSearchPage.searchCaseFile(caseName, "Southwark", todaysDate());
    await caseSearchPage.goToUpdateCase(caseName, todaysDate());
    await caseDetailsPage.removeCase(timeoutMs);

    const isDeletionConfirmed = await caseSearchPage.confirmCaseDeletion(
      caseName,
      "Southwark",
      todaysDate(),
    );

    if (!isDeletionConfirmed) {
      throw new Error(`Case deletion confirmation failed for ${caseName}.`);
    }
  });

  if (success) {
    console.log(`✅ Case successfully deleted and confirmed: ${caseName}`);
  } else {
    console.error(`❌ Failed to delete ${caseName}. Check logs for details.`);
  }
}
