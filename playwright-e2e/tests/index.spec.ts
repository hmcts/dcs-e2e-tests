import { test } from "../fixtures";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { sections, config, pushTestResult } from "../utils";
import { DocumentModel } from "../data/documentModel";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";

/**
 * Index Page – Sections & Document Validation
 * -------------------------------------------
 *
 * This test validates the behaviour of the Case Index page when interacting
 * with section-based document uploads.
 *
 * The flow covered includes:
 *  - Creating a new case with defendants and defence users
 *  - Navigating to case Sections and selecting unrestricted sections
 *  - Uploading documents via section links
 *  - Verifying that uploaded documents appear correctly on the Index page
 *
 * Purpose:
 * - Ensures that section-to-index document linkage is working as expected
 * - Validates Index page document rendering and metadata
 * - Acts as a regression guard for document visibility issues
 *
 * Test characteristics:
 * - Aggregates validation issues instead of failing immediately
 * - Performs explicit cleanup to avoid test data pollution
 */

test.describe("@nightly @regression Index Page Functionality", () => {
  /**
   * Shared state across the test:
   * - newCaseName is used for both validation messaging and cleanup
   * - unrestrictedUploadResults aggregates all validation issues before failing
   */
  let newCaseName: string;
  const unrestrictedUploadResults: string[] = [];

  test.beforeEach(
    async ({
      homePage,
      caseSearchPage,
      caseDetailsPage,
      createCasePage,
      addDefendantPage,
      peoplePage,
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();

      // Create a fully configured case with defendants and defence users
      const newCase = await createNewCaseWithDefendantsAndUsers(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        "TestCase",
        "TestURN",
        "Admin",
      );
      newCaseName = newCase.newCaseName;
    },
  );

  test(`Upload & Validate Sections & Documents from Index Page`, async ({
    caseDetailsPage,
    indexPage,
    sectionDocumentsPage,
    sectionsPage,
    uploadDocumentPage,
  }) => {
    await caseDetailsPage.caseNavigation.navigateTo("Sections");

    // Retrieve keys for unrestricted sections and randomly sample one
    // This reduces execution time while still providing coverage
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
      sections.unrestricted,
    );
    const sampleEntries: string[] = Object.values(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    await caseDetailsPage.caseNavigation.navigateTo("Index");

    for (const sectionKey of sampleEntries) {
      await indexPage.goToIndexSectionLink(sectionKey);
      await sectionDocumentsPage.goToUploadDocuments();
      await uploadDocumentPage.uploadUnrestrictedDocument(
        "unrestrictedSectionUpload",
      );
      await caseDetailsPage.caseNavigation.navigateTo("Index");
      const documentList = await indexPage.getIndexDocuments();

      // Build the expected document model to compare against the Index page output
      // This ensures section title, document name, and numbering are correct
      const expectedDocuments: DocumentModel[] = [];

      for (const sectionKey of sampleEntries) {
        const sectionTitle = await indexPage.getSectionTitle(sectionKey);

        expectedDocuments.push({
          sectionTitle,
          sectionId: sectionKey,
          documentName: "unrestrictedSectionUpload",
          documentNumber: "1",
        });
      }

      // Collect any validation issues instead of failing immediately
      // This allows us to report all Index inconsistencies in a single run
      const uploadIssues = await indexPage.validateIndexDocuments(
        expectedDocuments,
        documentList,
      );

      if (uploadIssues) {
        unrestrictedUploadResults.push(...uploadIssues);
      }
      // Aggregate Results
      pushTestResult({
        user: config.users.hmctsAdmin.group,
        heading: `Index Validation: Upload Unrestricted Document`,
        category: "Index",
        issues: unrestrictedUploadResults,
      });

      // Fail the test if any issues were found after all validation has completed
      if (unrestrictedUploadResults.length > 0) {
        throw new Error(
          `User ${
            config.users.hmctsAdmin.group
          } experienced issues uploading unrestricted documents on Index for ${newCaseName}:\n${unrestrictedUploadResults.join(
            "\n",
          )}`,
        );
      }
    }
  });

  //Cleanup: Remove dynamically created case
  test.afterEach(async () => {
    if (!newCaseName) return;

    await runCleanupSafely(async () => {
      console.log(`Attempting to delete test case: ${newCaseName}`);
      await deleteCaseByName(newCaseName, 180_000);
      console.log(`Cleanup completed for ${newCaseName}`);
    }, 180_000);
  });
});
