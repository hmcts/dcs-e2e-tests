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
          await caseSearchPage.searchCaseFile(
            caseName,
            "Southwark",
            todaysDate()
          );

          const exists = await caseSearchPage.goToUpdateCase(
            caseName,
            todaysDate()
          );
          if (!exists) return true; // already deleted

          await caseDetailsPage.removeCase(timeoutMs);
          return await caseSearchPage.confirmCaseDeletion();
        },
        { timeout: timeoutMs, intervals: [500, 1000, 1500] }
      )
      .toBe(true);
  });
}
