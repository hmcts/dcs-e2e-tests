/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "../fixtures";
import ReviewEvidencePage from "../page-objects/pages/reviewEvidence.page";
import { UserCredentials, config } from "../utils";

// As a user
// I want to be able to access the Review Evidence Page
// And I should be able to see a list of the correct available Sections and Documents in the Index

// As a user
// I want to be able to click onto an available document
// And this document should render correctly on the page

test.describe("Documents are available and accessible on the Review Evidence page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  for (const [roleKey, user] of Object.entries(config.users) as [
    string,
    UserCredentials
  ][]) {
    test(`Sections and Documents are correctly available in the Index for user group: ${user.group}`, async ({
      loginPage,
      homePage,
      caseSearchPage,
    }) => {
      await loginPage.login(user);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
      const [popup] = await Promise.all([
        caseSearchPage.page.waitForEvent("popup"),
        caseSearchPage.goToReviewEvidence(),
      ]);

      const reviewEvidencePage = new ReviewEvidencePage(popup);

      // Filter expected documents based on User Group
      const expectedDocuments = await reviewEvidencePage.filterDocumentsByUser(
        user.group
      );

      // Get all available documents from Index for user
      const availableDocuments = await reviewEvidencePage.getDocuments(
        user.group
      );

      // Compare expected vs available sections and documents for user
      await reviewEvidencePage.compareExpectedVsAvailableSectionsAndDocuments(
        expectedDocuments,
        availableDocuments
      );
    });

    test(`Click through all document links and ensure document is rendered for user group: ${user.group}`, async ({
      loginPage,
      homePage,
      caseSearchPage,
    }) => {
      await loginPage.login(user);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
      const [popup] = await Promise.all([
        caseSearchPage.page.waitForEvent("popup"),
        caseSearchPage.goToReviewEvidence(),
      ]);

      const reviewEvidencePage = new ReviewEvidencePage(popup);

      // Get all Document Link Names and IDs
      const documentLinks = await reviewEvidencePage.getAllDocumentNames();
      await reviewEvidencePage.waitForAllDocumentLinksToLoad(documentLinks);
      const documentIds = await reviewEvidencePage.getAllDocumentIds();

      // Assert the count for both are equal
      const documentCount = await documentLinks.count();
      expect(documentCount).toStrictEqual(documentIds.length);

      // Select a random subset of up to 5 documents
      const sampleSize = Math.min(5, documentCount);
      const randomIndexes = Array.from({ length: documentCount }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, sampleSize);

      console.log(
        `Testing ${sampleSize} random documents out of ${documentCount} for ${user.group}`
      );
      console.log("Selected indexes:", randomIndexes);

      // Loop through to click selection of document links and ensure that the document in rendering correctly via Playwright Photosnaps
      for (const i of randomIndexes) {
        const documentLink = documentLinks.nth(i);
        const documentId = documentIds[i];

        console.log(
          `Checking document ${i + 1}/${documentCount} (ID: ${documentId} for ${
            user.group
          })`
        );

        await documentLink.click();
        await reviewEvidencePage.page.evaluate(() => window.scrollTo(0, 0));

        // Wait for the high-resolution image to be loaded
        await reviewEvidencePage.waitForHighResImageLoad(documentId);

        // Target document image for screenshot
        const documentImage = await reviewEvidencePage.getImageLocator(
          documentId
        );

        // Prepare standardised screenshot name
        const screenshotName = await reviewEvidencePage.standardiseFileName(
          documentLink
        );

        // Take and compare screenshot to expected document image
        await expect(documentImage).toHaveScreenshot(screenshotName, {
          maxDiffPixelRatio: 0.01,
        });
      }
    });
  }
});
