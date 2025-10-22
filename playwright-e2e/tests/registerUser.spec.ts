import { test, expect } from "../fixtures";

// ============================================================
// Test : New User Registration
// ============================================================

// As a user
// I want to be able to create a new Crown Court DCS Account
// And I should be able to get verified and approved by Access Coordinator.

test.describe("Register New user in CCDCS", () => {

test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOff")
  });

test("Approve/Reject New user registration", async ({
    registerUserPage,
    homePage,
    loginPage,
    caseSearchPage,
    userSettingsPage,
    approvalRequestsPage,
    approveAccessRequestPage,
    rejectAccessRequestPage,

}) => {
    await homePage.navigation.navigateTo("Register");
    await expect(registerUserPage.registerTitle).toContainText('Register');   
    const userName = await registerUserPage.enterUserRegDetails();
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("Admin");
    await userSettingsPage.searchUser(userName);
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
    await approvalRequestsPage.newApprovalRequests(userName);
    const isApproved = Math.random() < 0.5;
    console.log(isApproved);
    if (isApproved)
    {
      await approvalRequestsPage.approveButton.click();
      await expect (approveAccessRequestPage.approveRequestHeading).toHaveText('Approve Access Request')
      await approveAccessRequestPage.confirmApproval();
      await expect (approvalRequestsPage.returnMessage).toContainText('successfully approved!')
      await homePage.navigation.navigateTo("Admin");
      await userSettingsPage.searchUser(userName);
      await expect (userSettingsPage.approvedUserFlag).toContainText('Y')
      await homePage.navigation.navigateTo("LogOff");
      await homePage.navigation.navigateTo("LogOn");
      await loginPage.loginAsNewUserRegistered(userName);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await expect (caseSearchPage.caseSearchHeading).toHaveText('Case List')
    }
    else 
    {
      await approvalRequestsPage.rejectButton.click();
      await expect (rejectAccessRequestPage.rejectRequestHeading).toHaveText('Reject Access Request')
      await rejectAccessRequestPage.confirmReject();
      await expect (approvalRequestsPage.returnMessage).toContainText('Rejection confirmed!')
      await homePage.navigation.navigateTo("Admin");
      await userSettingsPage.searchUser(userName);
      await expect (userSettingsPage.deniedUserFlag).toContainText('Y')
      await homePage.navigation.navigateTo("LogOff");
      await homePage.navigation.navigateTo("LogOn");
      await loginPage.loginAsNewUserRegistered(userName);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await expect (homePage.accountMessage).toContainText('Your account registration has been rejected. If you require access to DCS, you must re-register. If you believe your account has been incorrectly rejected then please contact CITS:')
    }

  });
});

