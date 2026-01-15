import { test, expect } from "../fixtures";

// ============================================================
// Test : New User Registration
// ============================================================

// As a user
// I want to be able to create a new Crown Court DCS Account
// So I can access the DCS platform and relevant cases

// Key considerations:
// Email needs to be checked against a whitelist and provides a list of Roles applicable to that domain as follows.
// Domain Offered Role types:
// For "Self-Inviting Roles" - HMCTS Admin, Probation Staff, TestHMCTS, Full Time Judge, CPS Administrator and CPS Prosecutor.
// @justice.gov.uk - HMCTS Admin, Probation Staff, TestHMCTS
// @judiciary.gsi.gov.uk - Fee Paid Judge and Full Time Judge
// @cps.gov.uk - CPS Administrator and CPS Prosecutor
// For "Invitation Only Roles" - Defence Advocate, Fee Paid Judge, Outside Prosecuting Advocate.
// @pspb.cjsm.co.uk - Defence Advocate, Fee Paid Judge, Outside Prosecuting Advocate

// If the User has selected an Invitation Only Role,the account is flagged as “Approved” upon email verification.
// If the User has selected a Self-Inviting Role, post email verification, an Access Coordinator goes to an Approvals screen and either “Approve” or “Reject” the request.

test.describe("@nightly @regression Register New user in CCDCS", () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOff");
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
    // New user completes registration form

    await homePage.navigation.navigateTo("Register");
    await expect(registerUserPage.registerHeading).toContainText("Register");
    const { userName, userEmail, userRole, userLocation, isSelfInviteRole } =
      await registerUserPage.submitUserRegDetails();
    await homePage.navigation.navigateTo("LogOff");

    // Access Coordinator verifies email

    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("Admin");
    await expect(adminPage.adminHeading).toContainText(
      "Administration Options"
    );
    await adminPage.navigateToUsers();
    await userSettingsPage.searchUser(userName);
    await userSettingsPage.verifyUserEmail(userEmail);
    await homePage.navigation.navigateTo("LogOff");

    //New user logs back in after email verification

    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsNewUserRegistered(userName);
    await homePage.navigation.navigateTo("ViewCaseListLink");

    // Flow handlers - Self Inviting or Invitation Only user role actions

    // Self Invite user
    const handleSelfInviteFlow = async () => {
      await expect(homePage.accountMessage).toContainText(
        "Your account has been successfully verified and is now waiting for Approval from an Access Coordinator applicable to the Location and Role you have registered for."
      );
      await homePage.navigation.navigateTo("LogOff");
      await homePage.navigation.navigateTo("LogOn");
      await loginPage.loginAsAccessCoordinator();
      await homePage.navigation.navigateTo("ApprovalRequests");

      const actions = {
        approve: async () => {
          await approvalRequestsPage.clickApprove(
            userEmail,
            userRole,
            userLocation
          );
          await approveAccessRequestPage.approveUserRequest();

          await expect(approvalRequestsPage.returnMessage).toContainText(
            "successfully approved!"
          );

          await homePage.navigation.navigateTo("Admin");
          await adminPage.navigateToUsers();
          await userSettingsPage.verifyApprovalFlag(userName);

          await homePage.navigation.navigateTo("LogOff");
          await homePage.navigation.navigateTo("LogOn");
          await loginPage.loginAsNewUserRegistered(userName);
          await homePage.navigation.navigateTo("ViewCaseListLink");

          await expect(caseSearchPage.caseSearchHeading).toHaveText(
            "Case List"
          );
        },

        reject: async () => {
          await approvalRequestsPage.clickReject(
            userEmail,
            userRole,
            userLocation
          );
          await rejectAccessRequestPage.rejectUserRequest();

          await expect(approvalRequestsPage.returnMessage).toContainText(
            "Rejection confirmed!"
          );

          await homePage.navigation.navigateTo("Admin");
          await adminPage.navigateToUsers();
          await userSettingsPage.verifyRejectionFlag(userName);

          await homePage.navigation.navigateTo("LogOff");
          await homePage.navigation.navigateTo("LogOn");
          await loginPage.loginAsNewUserRegistered(userName);
          await homePage.navigation.navigateTo("ViewCaseListLink");

          await expect(homePage.accountMessage).toContainText(
            "Your account registration has been rejected. If you require access to DCS, you must re-register. If you believe your account has been incorrectly rejected then please contact CITS:"
          );
        },
      };

      const decision = Math.random() < 0.5 ? "approve" : "reject";
      await actions[decision]();
    };

    // Invitation Only user
    const handleInvitationOnlyFlow = async () => {
      await expect(caseSearchPage.caseSearchHeading).toHaveText("Case List");
    };

    // Execute correct flow
    const flowByRoleType = {
      true: handleSelfInviteFlow,
      false: handleInvitationOnlyFlow,
    };

    await flowByRoleType[String(isSelfInviteRole)]();
  });
});
