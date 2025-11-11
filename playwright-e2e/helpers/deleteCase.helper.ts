import { Page } from "playwright-core";
import { config } from "../utils";
import { loginAndOpenCase } from "./login.helper";

export async function deleteCaseByName(
  caseName: string,
  caseSearchPage,
  caseDetailsPage,
  homePage,
  loginPage,
  page: Page
) {
  try {
    if (
      await page
        .getByRole("link", { name: "Log Off" })
        .isVisible({ timeout: 2000 })
    ) {
      await page.getByRole("link", { name: "Log Off" }).click();
    }
    await homePage.navigation.navigateTo("LogOn");
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.deleteAdmin,
      caseName
    );
    await caseDetailsPage.removeCase();
    await caseSearchPage.confirmCaseDeletion();
    console.log(` ✅ ${caseName} successfully deleted`);
  } catch (err) {
    console.warn(`⚠️ Could not delete case ${caseName}: ${err}`);
  }
}
