import { test } from "../fixtures";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { sections, config, pushTestResult } from "../utils";
import { DocumentModel } from "../data/documentModel";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";

test.describe("Index Page Functionality", () => {
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

      // Create Case with Defendants and Defence Users
      const newCase = await createNewCaseWithDefendantsAndUsers(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        "TestCase",
        "TestURN",
        "Admin"
      );
      newCaseName = newCase.newCaseName;
    }
  );

  test(`Retrieve & Validate Sections & Documents from Index Page`, async ({
    caseDetailsPage,
    indexPage,
    sectionDocumentsPage,
    sectionsPage,
    uploadDocumentPage,
  }) => {
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
      sections.unrestricted
    );
    const sampleEntries: string[] = Object.values(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    console.log("sampleEntries", sampleEntries);
    await caseDetailsPage.caseNavigation.navigateTo("Index");

    for (const sectionKey of sampleEntries) {
      await indexPage.goToIndexSectionLink(sectionKey);
      await sectionDocumentsPage.goToUploadDocuments();
      await uploadDocumentPage.uploadUnrestrictedDocument(
        "unrestrictedSectionUpload"
      );
      await caseDetailsPage.caseNavigation.navigateTo("Index");
      const documentList = await indexPage.getIndexDocuments();

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
      console.log("expected document", expectedDocuments);

      console.log("DOCUMENT LIST", documentList);
      const uploadIssues = await indexPage.validateIndexDocuments(
        expectedDocuments,
        documentList
      );

      if (uploadIssues) {
        unrestrictedUploadResults.push(...uploadIssues);
      }
      // Aggragate Results
      pushTestResult({
        user: config.users.hmctsAdmin.group,
        heading: `Index Validation: Upload Unrestricted Document`,
        category: "Index",
        issues: unrestrictedUploadResults,
      });

      // Fail the test if any issues were found
      if (unrestrictedUploadResults.length > 0) {
        throw new Error(
          `User ${
            config.users.hmctsAdmin.group
          } experienced issues uploading unrestricted documents on Index for ${newCaseName}:\n${unrestrictedUploadResults.join(
            "\n"
          )}`
        );
      }
    }
  });
  test.afterEach(async () => {
    if (!newCaseName) return;

    await runCleanupSafely(async () => {
      console.log(`Attempting to delete test case: ${newCaseName}`);
      await deleteCaseByName(newCaseName, 180_000);
      console.log(`Cleanup completed for ${newCaseName}`);
    }, 180_000);
  });
});
