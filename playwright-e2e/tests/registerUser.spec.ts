import { test, expect } from "../fixtures";

/**
 * New User Registration Test Suite
 * --------------------------------
 *
 * Purpose:
 * Verify that new users can successfully register for a Crown Court DCS account,
 * and that the registration flows behave correctly for different types of roles.
 *
 * User Flows Covered:
 * 1. Self-Inviting Roles:
 *    - HMCTS Admin, Probation Staff, TestHMCTS, Full Time Judge, CPS Administrator, CPS Prosecutor
 *    - After email verification, registration must be approved/rejected by an Access Coordinator.
 *    - Approval allows login and access to Case List; rejection blocks access and displays an appropriate message.
 *
 * 2. Invitation-Only Roles:
 *    - Defence Advocate, Fee Paid Judge, Outside Prosecuting Advocate
 *    - After email verification, accounts are automatically approved and can log in immediately.
 *
 * Domain and Role Mapping:
 *  - @justice.gov.uk: HMCTS Admin, Probation Staff, TestHMCTS
 *  - @judiciary.gsi.gov.uk: Fee Paid Judge, Full Time Judge
 *  - @cps.gov.uk: CPS Administrator, CPS Prosecutor
 *  - @pspb.cjsm.co.uk: Defence Advocate, Fee Paid Judge, Outside Prosecuting Advocate
 *
 * Key Technical Notes:
 *  - Flow diverges based on `isSelfInviteRole` flag.
 *  - Randomly tests approval or rejection path for self-invite users to cover both outcomes.
 *  - Explicit expectations are used at each stage to validate page headings, account messages,
 *    and approval/rejection status flags.
 *
 * Test Steps:
 * 1. Navigate to the Register page and submit new user registration details.
 * 2. Access Coordinator verifies the email and approves/rejects if required.
 * 3. New user attempts login and the system responds according to role type and approval status.
 * 4. Validate success or rejection messages and that the user can/cannot access Case List.
 */

test.describe("@nightly @regression Register New user in CCDCS", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
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
    await homePage.navigation.logOff();

    // Access Coordinator verifies the new user's email

    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsAccessCoordinator();
    await homePage.navigation.navigateTo("Admin");
    await expect(adminPage.adminHeading).toContainText(
      "Administration Options",
    );
    await adminPage.navigateToUsers();
    await userSettingsPage.searchUser(userName);
    await userSettingsPage.verifyUserEmail(userEmail);
    await homePage.navigation.logOff();

    //New user logs in post-email verification

    await homePage.navigation.navigateTo("LogOn");
    await loginPage.loginAsNewUserRegistered(userName);
    await homePage.navigation.navigateTo("ViewCaseListLink");

    // Flow handlers - Self Inviting or Invitation Only user role actions

    // Handle Self-Invite Role flow
    const handleSelfInviteFlow = async () => {
      await expect(homePage.accountMessage).toContainText(
        "Your account has been successfully verified and is now waiting for Approval from an Access Coordinator applicable to the Location and Role you have registered for.",
      );
      await homePage.navigation.logOff();
      await homePage.navigation.navigateTo("LogOn");
      await loginPage.loginAsAccessCoordinator();
      await homePage.navigation.navigateTo("ApprovalRequests");

      // Randomly choose approve or reject path to cover both outcomes
      const actions = {
        approve: async () => {
          await approvalRequestsPage.clickApprove(
            userEmail,
            userRole,
            userLocation,
          );
          await approveAccessRequestPage.approveUserRequest();

          await expect(approvalRequestsPage.returnMessage).toContainText(
            "successfully approved!",
          );
          // Verify approval flag in user settings
          await homePage.navigation.navigateTo("Admin");
          await adminPage.navigateToUsers();
          await userSettingsPage.verifyApprovalFlag(userName);

          await homePage.navigation.logOff();
          await homePage.navigation.navigateTo("LogOn");
          await loginPage.loginAsNewUserRegistered(userName);

          // Confirm user can access Case Search
          await homePage.navigation.navigateTo("ViewCaseListLink");
          await expect(caseSearchPage.caseSearchHeading).toHaveText(
            "Case List",
          );
        },

        reject: async () => {
          await approvalRequestsPage.clickReject(
            userEmail,
            userRole,
            userLocation,
          );
          await rejectAccessRequestPage.rejectUserRequest();

          await expect(approvalRequestsPage.returnMessage).toContainText(
            "Rejection confirmed!",
          );

          // Verify rejection flag in user settings
          await homePage.navigation.navigateTo("Admin");
          await adminPage.navigateToUsers();
          await userSettingsPage.verifyRejectionFlag(userName);

          await homePage.navigation.logOff();
          await homePage.navigation.navigateTo("LogOn");
          await loginPage.loginAsNewUserRegistered(userName);

          // Expect rejection message preventing access
          await homePage.navigation.navigateTo("ViewCaseListLink");
          await expect(homePage.accountMessage).toContainText(
            "Your account registration has been rejected. If you require access to DCS, you must re-register. If you believe your account has been incorrectly rejected then please contact CITS:",
          );
        },
      };

      const decision = Math.random() < 0.5 ? "approve" : "reject";
      await actions[decision]();
    };

    // Handle Invitation-Only Role flow
    const handleInvitationOnlyFlow = async () => {
      // Account should be approved automatically; verify access to Case Search
      await expect(caseSearchPage.caseSearchHeading).toHaveText("Case List");
    };

    // Execute appropriate flow based on role type
    const flowByRoleType = {
      true: handleSelfInviteFlow,
      false: handleInvitationOnlyFlow,
    };

    await flowByRoleType[String(isSelfInviteRole)]();
  });
});
