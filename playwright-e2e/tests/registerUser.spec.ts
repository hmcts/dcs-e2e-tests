import { test, expect } from "../fixtures";

test.describe.serial("Register New user in CCDCS", () => {

test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.open();
  });

test("Approve New user", async ({
    registerUserPage,
    homePage,
    loginPage
}) => {

    await registerUserPage.registerLink.click();
    await expect(registerUserPage.registerTitle).toContainText('Register');   
    const userName = await registerUserPage.enterUserRegDetails();
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.invalidLogin("SJagadeesan", "suganDCSTen10")
    await registerUserPage.checkUserStatus(userName);
    await registerUserPage.updateVerifyUserFlag();  // Verify Email to AC for approval
    await expect(registerUserPage.verifiedUserFlag).toHaveText('Y');

   
     })


});
