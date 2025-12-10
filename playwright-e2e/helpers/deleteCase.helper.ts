import { config } from "../utils";
import { chromium, Page, BrowserContext } from "playwright";
import { expect } from "../fixtures";
import { todaysDate } from "../utils";
import CaseSearchPage from "../page-objects/pages/caseSearch.page";
import CaseDetailsPage from "../page-objects/pages/caseDetails.page";

export async function runAsAdmin(
  callback: (page: Page) => Promise<void>,
  headed = true
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

export async function deleteCaseByName(caseName: string, timeoutMs = 60000) {
  if (!caseName) return;

  await runAsAdmin(async (page) => {
    const caseSearchPage = new CaseSearchPage(page);
    const caseDetailsPage = new CaseDetailsPage(page);

    await expect
      .poll(
        async () => {
          await page.goto(
            `${config.urls.base}Case/CaseIndex?currentFirst=1&displaySize=10`
          );

          let caseExists = true;

          try {
            // If the case cannot be found, consider it already deleted
            await caseSearchPage.searchCaseFile(
              caseName,
              "Southwark",
              todaysDate()
            );
          } catch {
            caseExists = false;
          }

          if (!caseExists) return true; // already deleted

          const onUpdatePage = await caseSearchPage.goToUpdateCase(
            caseName,
            todaysDate()
          );
          if (!onUpdatePage) return true; // already deleted

          // Perform deletion
          await caseDetailsPage.removeCase(timeoutMs);

          // Confirm deletion succeeded
          return await caseSearchPage.confirmCaseDeletion();
        },
        { timeout: timeoutMs, intervals: [500, 1000, 1500] }
      )
      .toBe(true);
  });
  console.log(`Successfully deleted ${caseName}`);
}
