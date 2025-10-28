export async function loginAndOpenCase(
  homePage,
  loginPage,
  caseDetailsPage,
  user,
  caseName
) {
  await homePage.navigation.navigateTo("LogOn");
  await loginPage.login(user);
  await homePage.navigateToExistingCase("Southwark", caseName);
  await caseDetailsPage.caseNavigation.navigateTo("Sections");
}
