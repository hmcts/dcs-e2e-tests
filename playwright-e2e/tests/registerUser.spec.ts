import { test, expect } from "../fixtures";

// ============================================================
// Test : New User Registration
// ============================================================

// As a user
// I want to be able to create a new Crown Court DCS Account

// 1. The Registrant completes the registration form.
// 2. As part of the registration process they are prompted to enter their Primary email address
// 3. DCS looks up their Primary email address against a whitelist and provides a list of Roles applicable to that domain as follows.

// Domain Offered Role types:
// For "Self-Inviting Roles" - HMCTS Admin, Probation Staff, TestHMCTS, Full Time Judge, CPS Administrator and CPS Prosecutor.
// @justice.gov.uk - HMCTS Admin, Probation Staff, TestHMCTS
// @judiciary.gsi.gov.uk - Fee Paid Judge and Full Time Judge 
// @cps.gov.uk - CPS Administrator and CPS Prosecutor
// For "Invitation Only Roles" - Defence Advocate, Fee Paid Judge, Outside Prosecuting Advocate.
// @pspb.cjsm.co.uk - Defence Advocate, Fee Paid Judge, Outside Prosecuting Advocate 

// 4. The Registrant selects their Role (Where there is more than one possibility in Table 7).
// 5. DCS checks that the remainder of the mandatory fields have been completed.
// 6. The Registrant submits the registration form.
// 7. DCS checks the status of any existing accounts (See below).
// 8. DCS emails the Registrant to inform them that their registration has been submitted and is provides a verification link.
// 9. The User completed the self-verification process.
// 10. If the User has selected an Invitation Only Role,the account is flagged as “Approved” upon verification.
// 11. If the User has selected a Self-Inviting Role, DCS emails the Access Coordinators for the User’s requested Location and Role.
// 12. An Access Coordinator goes to an Approvals screen and sees the outstanding Approval request. They either “Approve” or “Reject” the request.

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
    adminPage,
    userSettingsPage,
    approvalRequestsPage,
    approveAccessRequestPage,
    rejectAccessRequestPage,

}) => {
    await homePage.navigation.navigateTo("Register");
    await expect(registerUserPage.registerHeading).toContainText('Register');   
    const {userName, userEmail, userRole, userLocation, isSelfInviteRole} = await registerUserPage.submitUserRegDetails();
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("Admin");
    await expect(adminPage.adminHeading).toContainText('Administration Options');   
    await adminPage.usersLink.click();
    await expect(userSettingsPage.userSettingsHeading).toContainText('People List');   
    await userSettingsPage.searchUser(userName);
    await userSettingsPage.updateVerifyUserFlag();  
    await expect(userSettingsPage.verifiedUserFlag).toHaveText('Y');
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsNewUserRegistered(userName)
    await homePage.navigation.navigateTo("ViewCaseListLink");

    // Random selection - Self Inviting or Invitation only user roles
    if (isSelfInviteRole)          
    {
    await expect (homePage.accountMessage).toContainText('Your account has been successfully verified and is now waiting for Approval from an Access Coordinator applicable to the Location and Role you have registered for.');
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("ApprovalRequests");
    await expect (approvalRequestsPage.approvalRequestsHeading).toHaveText('Approval Requests')
    await expect (approvalRequestsPage.acRoles).toContainText(userRole);
    await expect (approvalRequestsPage.acLocations).toContainText(userLocation);
    await expect(approvalRequestsPage.userEmail).toContainText(new RegExp(userEmail, "i"));
    await expect(approvalRequestsPage.userLocation).toHaveText(userLocation);
    await expect(approvalRequestsPage.userRole).toHaveText(userRole);
    const isApproved = Math.random() < 0.5;
    console.log('User approved:',isApproved);
    if (isApproved)
    {
      await approvalRequestsPage.approveButton.click();
      await expect (approveAccessRequestPage.approveRequestHeading).toHaveText('Approve Access Request')
      await approveAccessRequestPage.confirmApproval();
      await expect (approvalRequestsPage.returnMessage).toContainText('successfully approved!')
      await homePage.navigation.navigateTo("Admin");
      await expect(adminPage.adminHeading).toContainText('Administration Options');   
      await adminPage.usersLink.click();
      await expect(userSettingsPage.userSettingsHeading).toContainText('People List');   
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
      await expect(adminPage.adminHeading).toContainText('Administration Options');   
      await adminPage.usersLink.click();
      await expect(userSettingsPage.userSettingsHeading).toContainText('People List');   
      await userSettingsPage.searchUser(userName);
      await expect (userSettingsPage.deniedUserFlag).toContainText('Y')
      await homePage.navigation.navigateTo("LogOff");
      await homePage.navigation.navigateTo("LogOn");
      await loginPage.loginAsNewUserRegistered(userName);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await expect (homePage.accountMessage).toContainText('Your account registration has been rejected. If you require access to DCS, you must re-register. If you believe your account has been incorrectly rejected then please contact CITS:')
    }
  }
  // Invitation Only user
  else{
      await expect (caseSearchPage.caseSearchHeading).toHaveText('Case List')
  }
  });
});

