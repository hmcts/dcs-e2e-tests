/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "../fixtures";
import { UserCredentials, config } from "../utils";

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

test.describe("Sections Page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const documentResults: { user: string; issues: string[] }[] = [];

  for (const [roleKey, user] of Object.entries(config.users) as [
    string,
    UserCredentials
  ][]) {
    test(`Verify Sections & Documents for: ${user.group}`, async ({
      loginPage,
      caseSearchPage,
      caseDetailsPage,
      sectionsPage,
    }) => {
      test.setTimeout(360_000);
      const currentUserIssues: string[] = [];
      try {
        await loginPage.login(user);
        await loginPage.navigation.navigateTo("ViewCaseListLink");
        await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
        await caseSearchPage.goToUpdateCase();
        await caseDetailsPage.caseNavigation.navigateTo("Sections");
        const availableDocuments =
          await sectionsPage.getSectionAndDocumentDetails();
        const expectedDocuments = await sectionsPage.filterDocumentsByUser(
          user.group
        );
        const { missingDocuments, unexpectedDocuments } =
          await sectionsPage.compareExpectedVsAvailableSectionsAndDocuments(
            availableDocuments,
            expectedDocuments
          );

        // If there are any section or document issues, push to currentUserIssues
        currentUserIssues.push(...missingDocuments, ...unexpectedDocuments);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(String(error));
        }
      } finally {
        // Push each User result to documentResults for later analysis
        documentResults.push({ user: user.group, issues: currentUserIssues });
      }
    });
  }

  test.afterAll(() => {
    // Build a readable summary string
    const summaryLines: string[] = [];
    summaryLines.push("===== SECTION & DOCUMENT AVAILABILITY SUMMARY =====");

    documentResults.forEach(({ user, issues }) => {
      if (issues.length > 0) {
        summaryLines.push(`❌ ${user}:`);
        issues.forEach((i) => summaryLines.push(`   - ${i}`));
      }
    });

    summaryLines.push("===================================================");

    // Check if any user has issues
    const anyIssues = documentResults.some(
      (result) => result.issues.length > 0
    );

    // Include the summary in the expect failure message
    const message = [
      "User had missing or unexpected documents:",
      "",
      ...summaryLines,
    ].join("\n");

    expect(anyIssues, message).toBe(false);
  });
});
