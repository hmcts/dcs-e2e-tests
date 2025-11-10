/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "../fixtures";
import ReviewEvidencePage from "../page-objects/pages/reviewEvidence.page";
import { UserCredentials, config, assertNoIssues } from "../utils";

// ============================================================
// Test 1: Sections & Documents Availability
// ============================================================

// As a user
// I want to be able to access the Review Evidence Page
// And I should be able to see a list of the correct available Sections and Documents in the Index for an existing case

test.describe("Sections and Documents availability", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const documentResults: { user: string; issues: string[] }[] = [];

  for (const [_, user] of Object.entries(config.users) as [
    string,
    UserCredentials
  ][]) {
    test(`Verify Sections & Documents in Navigation Panel for: ${user.group}`, async ({
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
          await reviewEvidencePage.compareExpectedVsAvailableDocuments(
            expectedDocuments,
            availableDocuments
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
    const documentsCheck = documentResults.map((r) => ({
      label: r.user,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      documentsCheck,
      "SECTION & DOCUMENT AVAILABILITY SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });
});

// ============================================================
// Test 2: Document Rendering / Photosnaps
// ============================================================

// As a user
// I want to be able to click onto an available document in the Index
// And this document should render correctly on the page

test.describe("Document rendering / photosnaps", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const renderResults: { user: string; issues: string[] }[] = [];

  for (const [_, user] of Object.entries(config.users) as [
    string,
    UserCredentials
  ][]) {
    test(`Render a sample of documents for: ${user.group}`, async ({
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

        // Loop through to click sample of document links and ensure that the document is rendering correctly via Playwright Photosnaps
        for (const [index, doc] of sampleDocs.entries()) {
          try {
            const documentLink = reviewEvidencePage.page.locator(
              `[id='${doc.documentId}']`
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
              sampleDocs.length
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
              `Screenshot mismatch for "${doc.documentName}" in section "${doc.sectionTitle}"`
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
    const renderCheck = renderResults.map((r) => ({
      label: r.user,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      renderCheck,
      "DOCUMENT RENDERING SUMMARY"
    );
    if (anyIssues) {
      const message = [
        "User had document rendering issues:",
        "",
        ...summaryLines,
      ].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });
});
