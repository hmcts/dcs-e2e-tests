import { test, expect } from "../fixtures";

test.describe.serial("Register New user in CCDCS", () => {

test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.open();
  });

test("Approve New user registration", async ({
    registerUserPage,
    homePage,
    loginPage,
    userSettingsPage,
    approvalRequestsPage,
    approveAccessRequestPage,

}) => {
    await homePage.navigation.navigateTo("Register");
    await expect(registerUserPage.registerTitle).toContainText('Register');   
    const userName = await registerUserPage.enterUserRegDetails();
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("Admin");
    await userSettingsPage.checkUserStatus(userName);
    await userSettingsPage.updateVerifyUserFlag();  // Verify Email format to AC for approval to be added 
    await expect(userSettingsPage.verifiedUserFlag).toHaveText('Y');
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsNewUserRegistered(userName)
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await expect (homePage.accountMessage).toContainText('Your account has been successfully verified and is now waiting for Approval from an Access Coordinator applicable to the Location and Role you have registered for.');
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("ApprovalRequests");
    await expect (approvalRequestsPage.approvalRequestsHeading).toHaveText('Approval Requests')
    await expect (approvalRequestsPage.acRole).toContainText('CPS Administrator');
    await expect (approvalRequestsPage.acLocation).toContainText('Southwark');
    await approvalRequestsPage.approveUserRequest(userName);
    await approveAccessRequestPage.confirmApproval();
    await expect (approvalRequestsPage.returnMessage).toContainText('successfully approved!')
    await homePage.navigation.navigateTo("LogOff");
  });


test("Reject New user registration", async ({
    registerUserPage,
    homePage,
    loginPage,
    userSettingsPage,
    approvalRequestsPage,
    rejectAccessRequestPage,

}) => {
    await homePage.navigation.navigateTo("Register");
    await expect(registerUserPage.registerTitle).toContainText('Register');   
    const userName = await registerUserPage.enterUserRegDetails();
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("Admin");
    await userSettingsPage.checkUserStatus(userName);
    await userSettingsPage.updateVerifyUserFlag();  // Verify Email format to AC for approval to be added 
    await expect(userSettingsPage.verifiedUserFlag).toHaveText('Y');
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsNewUserRegistered(userName)
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await expect (homePage.accountMessage).toContainText('Your account has been successfully verified and is now waiting for Approval from an Access Coordinator applicable to the Location and Role you have registered for.');
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("ApprovalRequests");
    await expect (approvalRequestsPage.approvalRequestsHeading).toHaveText('Approval Requests')
    await expect (approvalRequestsPage.acRole).toContainText('CPS Administrator');
    await expect (approvalRequestsPage.acLocation).toContainText('Southwark');
    await approvalRequestsPage.rejectUserRequest(userName);
    await rejectAccessRequestPage.confirmReject();
    await expect (approvalRequestsPage.returnMessage).toContainText('Rejection confirmed!')
    await homePage.navigation.navigateTo("LogOff");
  });
});

