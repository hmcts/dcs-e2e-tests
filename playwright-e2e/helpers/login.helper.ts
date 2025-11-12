export async function loginAndOpenCase(
  homePage,
  loginPage,
  caseDetailsPage,
  caseSearchPage,
  user,
  caseName
) {
  await homePage.navigation.navigateTo("LogOn");
  await loginPage.login(user);
  await homePage.navigation.navigateTo("ViewCaseListLink");
  await caseSearchPage.searchCaseFile(caseName, "Southwark");
  await caseSearchPage.goToUpdateCase();
  await caseDetailsPage.caseNavigation.navigateTo("Sections");
}
