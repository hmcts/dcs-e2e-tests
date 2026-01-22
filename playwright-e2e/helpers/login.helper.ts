import { todaysDate } from "../utils";

/**
 * Logs in a user and navigates to and opens a specific case.
 */
export async function loginAndOpenCase(
  homePage,
  loginPage,
  caseSearchPage,
  user,
  caseName,
) {
  await homePage.navigation.navigateTo("LogOn");
  await loginPage.login(user);
  await homePage.navigation.navigateTo("ViewCaseListLink");
  await caseSearchPage.searchCaseFile(caseName, "Southwark", todaysDate());
  await caseSearchPage.goToUpdateCase(caseName, todaysDate());
}
