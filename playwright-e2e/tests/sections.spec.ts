/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "../fixtures";
import { UserCredentials, config, pushTestResult } from "../utils";

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

  const excludedGroups = [
    "AccessCoordinator",
    "DefenceAdvocateB",
    "DefenceAdvocateC",
    "Admin",
  ];

  for (const [_, user] of Object.entries(config.users).filter(
    ([_, user]) => !excludedGroups.includes(user.group)
  ) as [string, UserCredentials][]) {
    test(`Verify Sections & Documents for: ${user.group}`, async ({
      loginPage,
      caseSearchPage,
      caseDetailsPage,
      sectionsPage,
      homePage,
    }) => {
      const currentUserIssues: string[] = [];
      try {
        await loginPage.login(user);
        await homePage.navigation.navigateTo("ViewCaseListLink");
        await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
        await caseSearchPage.goToUpdateCase("01AD111111");
        await caseDetailsPage.caseNavigation.navigateTo("Sections");
        const availableDocuments =
          await sectionsPage.getSectionAndDocumentDetails();
        const expectedDocuments = await sectionsPage.filterDocumentsByUser(
          user.group
        );
        const { missingDocuments, unexpectedDocuments } =
          await sectionsPage.compareExpectedVsAvailableSectionsAndDocuments(
            expectedDocuments,
            availableDocuments
          );

        // If there are any section or document issues, push to currentUserIssues
        currentUserIssues.push(...missingDocuments, ...unexpectedDocuments);
      } catch (error: unknown) {
        console.error(
          `Error verifying section and document availability for ${user.group}:`,
          error
        );
      } finally {
        // Aggragate results across users
        pushTestResult({
          user: user.group,
          heading: `Verify Sections & Documents for ${user.group}`,
          category: "Sections/Sections Documents Page",
          issues: currentUserIssues,
        });
        // Fail the test if any issues were found
        expect(
          currentUserIssues.length,
          `User ${
            user.group
          } has missing/unexpected documents:\n${currentUserIssues.join("\n")}`
        ).toBe(0);
      }
    });
  }
});
