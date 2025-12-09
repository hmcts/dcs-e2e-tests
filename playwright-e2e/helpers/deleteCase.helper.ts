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
    // Log off if needed
    const logOffLink = page.getByRole("link", { name: "Log Off" });
    if (await logOffLink.isVisible({ timeout: 2000 })) {
      await logOffLink.click();
    }

    // Navigate to LogOn
    try {
      await homePage.navigation.navigateTo("LogOn");
    } catch (err) {
      console.warn("⚠️ Failed to navigate to LogOn:", err);
    }

    // Login and open the case
    try {
      await loginAndOpenCase(
        homePage,
        loginPage,
        caseSearchPage,
        config.users.admin,
        caseName
      );
    } catch (err) {
      console.warn(`⚠️ Failed to login/open case ${caseName}:`, err);
      return;
    }

    // Remove the case 
    try {
      await caseDetailsPage.removeCase(20000);
    } catch (err) {
      console.warn(`⚠️ Failed to remove case ${caseName}:`, err);
    }

    // Confirm deletion
    try {
      await caseSearchPage.confirmCaseDeletion();
      console.log(` ✅ ${caseName} successfully deleted`);
    } catch (err) {
      console.warn(`⚠️ Failed to confirm deletion for ${caseName}:`, err);
    }
  } catch (err) {
    console.warn(`⚠️ deleteCaseByName overall failure for ${caseName}:`, err);
  }
}
