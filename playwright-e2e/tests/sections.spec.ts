/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, currentUser, eligibleUsers } from "../fixtures";
import { UserCredentials, config, pushTestResult } from "../utils";

const TEST_USERS = process.env.TEST_USERS || "nightly";
// Please update TEST_USERS=regression locally to run all eligible users

/**
 * Sections & Documents – Availability and Access Validation
 * ---------------------------------------------------------
 *
 * This test suite validates that:
 *
 * 1) Users can access the Sections page
 * 2) Users see the correct Sections based on their role
 * 3) Each Section exposes only the Documents the user is authorised to view
 * 4) Documents are navigable and render correctly
 *
 * The suite is intentionally:
 *  - Role-driven (tests are executed per user group)
 *  - Fast to execute (sampling rather than exhaustive)
 * This provides high-confidence coverage of access control
 * without introducing test flakiness or excessive runtime.
 *
 * Execution scope:
 *  - nightly     → current user only
 *  - regression  → all eligible users
 */

// ============================================================
// Test 1: Sections Page & Documents Visibility
// ============================================================
//
// As a user
// I want to access the Sections page
// So that I can view the documents relevant to my role
//
// As a user
// I should only see Sections and Documents I am authorised to access
// So that sensitive information is not exposed across roles
//

test.describe("@nightly @regression Sections Page", () => {
  /**
   * Clear storage state explicitly to ensure:
   *  - No cross-test session leakage
   *  - Each user test starts from a clean authentication boundary
   */
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  /**
   * Dynamically determine which users to validate based on execution scope.
   * This allows the same test logic to be reused across:
   *  - Fast nightly pipelines
   *  - Full regression runs
   */
  const usersToTest = TEST_USERS === "nightly" ? [currentUser] : eligibleUsers;

  for (const user of usersToTest) {
    test(`Verify Sections & Documents for: ${user.group}`, async ({
      loginPage,
      caseSearchPage,
      caseDetailsPage,
      sectionsPage,
      homePage,
    }) => {
      // Collect issues per user instead of failing immediately.
      const currentUserIssues: string[] = [];

      await loginPage.login(user);
      // Navigate to a known stable case used for visibility validation
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
      await caseSearchPage.goToUpdateCase("01AD111111");
      await caseDetailsPage.caseNavigation.navigateTo("Sections");

      // Retrieve a representative sample of:
      // - Available Sections
      // - Documents within those Sections
      const sampleDocuments =
        await sectionsPage.getSectionsAndDocumentsSample();

      // Determine which Sections and Documents should be visible to the current user
      // based on role-based access rules.
      const expectedDocuments = await sectionsPage.filterDocumentsByUser(
        user.group,
      );

      // Compare expected vs actual visibility.
      const unexpectedDocuments =
        await sectionsPage.compareExpectedVsAvailableSectionsAndDocumentsSample(
          expectedDocuments,
          sampleDocuments,
        );

      // Accumulate all visibility issues for this user
      currentUserIssues.push(...unexpectedDocuments);

      // Aggragate results across users
      pushTestResult({
        user: user.group,
        heading: `Verify Sections & Documents for ${user.group}`,
        category: "Sections/Sections Documents Page",
        issues: currentUserIssues,
      });
      // Fail the test if any issues were found after all user checks are complete
      if (currentUserIssues.length > 0) {
        throw new Error(
          `User ${
            user.group
          } has missing/unexpected documents:\n${currentUserIssues.join("\n")}`,
        );
      }
    });
  }
});
