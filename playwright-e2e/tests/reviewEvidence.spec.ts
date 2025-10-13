/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "../fixtures";
import ReviewEvidencePage from "../page-objects/pages/reviewEvidence.page";
import { UserCredentials, config } from "../utils";

// ============================================================
// Test 1: Sections & Documents Availability
// ============================================================

// As a user
// I want to be able to access the Review Evidence Page
// And I should be able to see a list of the correct available Sections and Documents in the Index

test.describe("Sections and Documents availability", () => {
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
    test(`Sections and Documents are correctly available in the Index for user group: ${user.group}`, async ({
      loginPage,
      homePage,
      caseSearchPage,
    }) => {
      const currentUserIssues: string[] = [];

      try {
        await loginPage.login(user);
        await homePage.navigation.navigateTo("ViewCaseListLink");
        await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
        const [popup] = await Promise.all([
          caseSearchPage.page.waitForEvent("popup"),
          caseSearchPage.goToReviewEvidence(),
        ]);

        const reviewEvidencePage = new ReviewEvidencePage(popup);

        // Filter expected documents based on User Group
        const expectedDocuments =
          await reviewEvidencePage.filterDocumentsByUser(user.group);

        // Get all available documents from Index for User
        const availableDocuments = await reviewEvidencePage.getDocuments(
          user.group
        );

        // Compare expected vs available sections and documents for User
        const { missingDocuments, unexpectedDocuments } =
          await reviewEvidencePage.compareExpectedVsAvailableSectionsAndDocuments(
            expectedDocuments,
            availableDocuments,
            user.group
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
    console.log("\n===== SECTION & DOCUMENT AVAILABILITY SUMMARY =====");
    documentResults.forEach(({ user, issues }) => {
      if (issues.length === 0) {
        console.log(`✅ ${user}: All checks passed`);
      } else {
        console.log(`❌ ${user}:`);
        issues.forEach((i) => console.log(`   - ${i}`));
      }
    });
    console.log("===================================================\n");

    const anyIssues = documentResults.some(
      (results) => results.issues.length > 0
    );
    expect(anyIssues, "Some users had missing or unexpected documents").toBe(
      false
    );
  });
});

// ============================================================
// Test 2: Document Rendering / Photosnaps
// ============================================================

// As a user
// I want to be able to click onto an available document
// And this document should render correctly on the page

test.describe("Document rendering / photosnaps", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const renderResults: { user: string; issues: string[] }[] = [];

  for (const [roleKey, user] of Object.entries(config.users) as [
    string,
    UserCredentials
  ][]) {
    test(`Render a sample of documents for user group: ${user.group}`, async ({
      loginPage,
      homePage,
      caseSearchPage,
    }) => {
      const currentUserIssues: string[] = [];

      try {
        await loginPage.login(user);
        await homePage.navigation.navigateTo("ViewCaseListLink");
        await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
        const [popup] = await Promise.all([
          caseSearchPage.page.waitForEvent("popup"),
          caseSearchPage.goToReviewEvidence(),
        ]);

        const reviewEvidencePage = new ReviewEvidencePage(popup);

        // Get all Documents by user
        const availableDocuments = await reviewEvidencePage.getDocuments(
          user.group
        );
        const filteredDocuments = availableDocuments.filter(
          (doc) => doc.documentName !== "No available document: name"
        );

        // Get document count
        const documentCount = filteredDocuments.length;
        expect(documentCount).toBeGreaterThan(0);

        // Pick up to 5 random documents to test
        const sampleDocs = filteredDocuments
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(5, documentCount));

        console.log(
          `Testing ${sampleDocs.length} random documents out of ${documentCount}`
        );

        // Loop through to click sample of document links and ensure that the document is rendering correctly via Playwright Photosnaps
        for (const [index, doc] of sampleDocs.entries()) {
          try {
            console.log(
              `[${index + 1}/${sampleDocs.length}] Checking "${
                doc.documentName
              }" in section "${doc.sectionTitle}"`
            );

            const documentLink = reviewEvidencePage.page.locator(
              `[id='${doc.documentId}']`
            );

            await documentLink.click();
            await reviewEvidencePage.page.evaluate(() => window.scrollTo(0, 0));

            // Wait for the high-resolution image to be loaded
            await reviewEvidencePage.waitForHighResImageLoad(
              doc.documentId ?? "",
              doc.documentName ?? ""
            );

            // Target document image for screenshot
            const documentImage = await reviewEvidencePage.getImageLocator(
              doc.documentId ?? ""
            );

            // Prepare standardised screenshot name
            const screenshotName = await reviewEvidencePage.standardiseFileName(
              reviewEvidencePage.page.locator(`[id='${doc.documentId}']`)
            );
            // Take and compare screenshot to expected document image

            await expect(documentImage).toHaveScreenshot(screenshotName, {
              maxDiffPixelRatio: 0.01,
            });
          } catch {
            currentUserIssues.push(
              `User ${user.group}: Screenshot mismatch for "${doc.documentName}" in section "${doc.sectionTitle}"`
            );
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(String(error));
        }
      } finally {
        renderResults.push({ user: user.group, issues: currentUserIssues });
      }
    });
  }

  test.afterAll(() => {
    console.log("\n===== DOCUMENT RENDERING SUMMARY =====");
    renderResults.forEach(({ user, issues }) => {
      if (issues.length === 0) {
        console.log(`✅ ${user}: All documents rendered correctly`);
      } else {
        console.log(`❌ ${user}:`);
        issues.forEach((i) => console.log(`   - ${i}`));
      }
    });
    console.log("======================================\n");

    const anyIssues = renderResults.some((result) => result.issues.length > 0);
    expect(anyIssues, "Some users had document rendering issues").toBe(false);
  });
});
