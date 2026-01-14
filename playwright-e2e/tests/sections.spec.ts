/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, currentUser, eligibleUsers } from "../fixtures";
import { UserCredentials, config, pushTestResult } from "../utils";

const TEST_USERS = process.env.TEST_USERS || "nightly";
// Please update TEST_USERS=regression locally to run all users

// ============================================================
// Test 1: Sections & Documents Availability
// ============================================================

// As a user
// I want to be able to access the Sections Page
// And I should be able to see a list of the correct available Sections

// As a user
// I want to be able to navigate to View Documents for each individual Section
// And I should be able to see a list of the correct available Documents in each Section

// As a user
// If I navigate to View each Document within a Section
// The View Document page should load

test.describe("@nightly @regression Sections Page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const usersToTest = TEST_USERS === "nightly" ? [currentUser] : eligibleUsers;

  for (const user of usersToTest) {
    test(`Verify Sections & Documents for: ${user.group}`, async ({
      loginPage,
      caseSearchPage,
      caseDetailsPage,
      sectionsPage,
      homePage,
    }) => {
      const currentUserIssues: string[] = [];
      await loginPage.login(user);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
      await caseSearchPage.goToUpdateCase("01AD111111");
      await caseDetailsPage.caseNavigation.navigateTo("Sections");

      const sampleDocuments =
        await sectionsPage.getSectionsAndDocumentsSample();
      const expectedDocuments = await sectionsPage.filterDocumentsByUser(
        user.group
      );
      const unexpectedDocuments =
        await sectionsPage.compareExpectedVsAvailableSectionsAndDocumentsSample(
          expectedDocuments,
          sampleDocuments
        );

      // If there are any section or document issues, push to currentUserIssues
      currentUserIssues.push(...unexpectedDocuments);

      // Aggragate results across users
      pushTestResult({
        user: user.group,
        heading: `Verify Sections & Documents for ${user.group}`,
        category: "Sections/Sections Documents Page",
        issues: currentUserIssues,
      });
      // Fail the test if any issues were found
      if (currentUserIssues.length > 0) {
        throw new Error(
          `User ${
            user.group
          } has missing/unexpected documents:\n${currentUserIssues.join("\n")}`
        );
      }
    });
  }
});
