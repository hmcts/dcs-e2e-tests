import { todaysDate } from "../utils";

export async function loginAndOpenCase(
  homePage,
  loginPage,
  caseSearchPage,
  user,
  caseName
) {
  await homePage.navigation.navigateTo("LogOn");
  await loginPage.login(user);
  await homePage.navigation.navigateTo("ViewCaseListLink");
  await caseSearchPage.searchCaseFile(caseName, "Southwark", todaysDate());
  await caseSearchPage.goToUpdateCase();
}
