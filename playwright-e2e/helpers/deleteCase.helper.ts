import { config } from "../utils";
import { chromium, Page, BrowserContext } from "playwright";
import { expect } from "../fixtures";
import { todaysDate } from "../utils";
import CaseSearchPage from "../page-objects/pages/caseSearch.page";
import CaseDetailsPage from "../page-objects/pages/caseDetails.page";

export async function runAsAdmin(
  callback: (page: Page) => Promise<void>,
  headed = false
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

export async function deleteCaseByName(caseName: string, timeoutMs = 20000) {
  if (!caseName) return;

  await runAsAdmin(async (page) => {
    const caseSearchPage = new CaseSearchPage(page);
    const caseDetailsPage = new CaseDetailsPage(page);

    await expect
      .poll(
        async () => {
          try {
            // Navigate to case list page
            await page.goto(
              `${config.urls.base}Case/CaseIndex?currentFirst=1&displaySize=10`
            );

            // Search and open case
            await caseSearchPage.searchCaseFile(
              caseName,
              "Southwark",
              todaysDate()
            );
            await caseSearchPage.goToUpdateCase(caseName, todaysDate());

            // Remove the case
            try {
              await caseDetailsPage.removeCase(timeoutMs);
            } catch (err) {
              console.warn(`⚠️ Failed to remove case ${caseName}:`, err);
            }

            // Confirm deletion
            try {
              await caseSearchPage.confirmCaseDeletion();
              console.log(`✅ ${caseName} successfully deleted`);
            } catch (err) {
              console.warn(
                `⚠️ Failed to confirm deletion for ${caseName}:`,
                err
              );
            }

            return true;
          } catch {
            return false; // retry poll
          }
        },
        { timeout: timeoutMs, intervals: [500, 1000, 1500] }
      )
      .toBe(true);
  });
}
