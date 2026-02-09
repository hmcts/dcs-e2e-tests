import { test, expect, currentUser, eligibleUsers } from "../fixtures";
import ReviewEvidencePage from "../page-objects/pages/case/reviewEvidence/reviewEvidence.page";
import { pushTestResult } from "../utils";

/**
 * Review Evidence: Sections & Documents – End-to-End Validation
 * -----------------------------------------------------------------------
 *
 * This test suite validates the availability and rendering of Sections and Documents
 * on the Review Evidence Page for existing cases. It covers two primary scenarios:
 *
 * 1) Sections & Documents Visibility
 *    - Ensures users only see sections and documents permitted for their role
 *    - Compares expected documents with actual UI display
 *
 * 2) Document Rendering / Photosnaps
 *    - Ensures documents can be opened and rendered correctly
 *    - Takes screenshots for high-fidelity validation
 *
 * Tests are role-aware and dynamically pick users based on execution scope:
 *  - nightly   → currentUser only (fast feedback)
 *  - regression → all eligible users (full coverage)
 *
 */

const TEST_USERS = process.env.TEST_USERS || "nightly";
// Please update TEST_USERS=regression locally to run all users

// ============================================================
// Test 1: Sections & Documents Availability
// ============================================================
//
// As a user
// I want to be able to access the Review Evidence Page
// And see only the sections and documents I am permitted to view
//
// The test validates:
//  - All expected sections and documents appear for the user's role
//  - No unexpected sections or documents appear

test.describe("@nightly @regression Sections and Documents availability", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const usersToTest = TEST_USERS === "nightly" ? [currentUser] : eligibleUsers;

  for (const user of usersToTest) {
    test(`Verify Sections & Documents in Navigation Panel for: ${user.group}`, async ({
      loginPage,
      homePage,
      caseSearchPage,
    }) => {
      const currentUserIssues: string[] = [];

      await loginPage.login(user);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
      const [popup] = await Promise.all([
        caseSearchPage.page.waitForEvent("popup"),
        caseSearchPage.goToReviewEvidence("01AD111111"),
      ]);

      const reviewEvidencePage = new ReviewEvidencePage(popup);

      // Filter expected documents based on User Group
      const expectedDocuments = await reviewEvidencePage.filterDocumentsByUser(
        user.group,
      );

      // Retrieve actual available documents from the UI
      const availableDocuments = await reviewEvidencePage.getDocuments(
        user.group,
      );

      // Compare expected vs available sections and documents and collect any mismatches
      const { missingDocuments, unexpectedDocuments } =
        await reviewEvidencePage.compareExpectedVsAvailableSectionsAndDocuments(
          expectedDocuments,
          availableDocuments,
        );

      // If there are any section or document issues, push to currentUserIssues
      currentUserIssues.push(...missingDocuments, ...unexpectedDocuments);

      //Aggregate results across users
      pushTestResult({
        user: user.group,
        heading: `Verify Sections & Documents for ${user.group}`,
        category: "Sections",
        issues: currentUserIssues,
      });
      // Fail the test if any issues were found
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

// ============================================================
// Test 2: Document Rendering / Photosnaps
// ============================================================
//
// As a user
// I want to open documents in the Review Evidence Index
// So that I can verify that they render correctly
//
// The test validates:
//  - Documents can be opened and fully loaded
//  - High-resolution images match baseline screenshots
//  - Any mismatches are reported per user role

test.describe("@regression Document rendering / photosnaps", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const usersToTest = TEST_USERS === "nightly" ? [currentUser] : eligibleUsers;

  for (const user of usersToTest) {
    test(`Render a sample of documents for: ${user.group}`, async ({
      loginPage,
      homePage,
      caseSearchPage,
    }) => {
      const currentUserIssues: string[] = [];

      await loginPage.login(user);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
      const [popup] = await Promise.all([
        caseSearchPage.page.waitForEvent("popup"),
        caseSearchPage.goToReviewEvidence("01AD111111"),
      ]);

      const reviewEvidencePage = new ReviewEvidencePage(popup);

      // Get all Documents by user
      const availableDocuments = await reviewEvidencePage.getDocuments(
        user.group,
      );
      const filteredDocuments = availableDocuments.filter(
        (doc) => doc.documentName !== "No available document: name",
      );

      // Get document count
      const documentCount = filteredDocuments.length;
      expect(documentCount).toBeGreaterThan(0);

      // Select up to 5 random documents to test
      const sampleDocs = filteredDocuments
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(5, documentCount));

      // Loop through to click sample of document links and ensure that the document is rendering correctly via Playwright Photosnaps
      for (const [index, doc] of sampleDocs.entries()) {
        try {
          const documentLink = reviewEvidencePage.page.locator(
            `[id='${doc.documentId}']`,
          );

          await documentLink.click();
          await reviewEvidencePage.page.evaluate(() => window.scrollTo(0, 0));

          // Wait for the high-resolution image to be loaded
          await reviewEvidencePage.waitForHighResImageLoad(
            doc.documentId ?? "",
            doc.documentName,
            user.group,
            index,
            doc.sectionTitle,
            sampleDocs.length,
          );

          // Target document image for screenshot
          const documentImage = await reviewEvidencePage.getImageLocator(
            doc.documentId ?? "",
          );

          // Prepare standardised screenshot name
          const screenshotName = await reviewEvidencePage.standardiseFileName(
            reviewEvidencePage.page.locator(`[id='${doc.documentId}']`),
          );
          // Take and compare screenshot to expected document image

          await expect(documentImage).toHaveScreenshot(screenshotName, {
            maxDiffPixelRatio: 0.01,
          });
        } catch {
          currentUserIssues.push(
            `Screenshot mismatch for "${doc.documentName}" in section "${doc.sectionTitle}"`,
          );
        }
      }
      //Aggregate results across users
      pushTestResult({
        user: user.group,
        heading: `Verify Document Rendering for ${user.group}`,
        category: "Sections",
        issues: currentUserIssues,
      });
      // Fail the test if any issues were found
      if (currentUserIssues.length > 0) {
        throw new Error(
          `User ${
            user.group
          } has document mismatches:\n${currentUserIssues.join("\n")}`,
        );
      }
    });
  }
});
