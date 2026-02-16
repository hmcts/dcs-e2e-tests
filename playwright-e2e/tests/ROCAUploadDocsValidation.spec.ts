import { test, expect } from "../fixtures";
import { ROCAModel } from "../data/ROCAModel";
import { config } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { sections, pushTestResult } from "../utils";
import { loginAndOpenCase } from "../helpers/login.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";

/**
 * ROCA: Document Upload & Access Validation
 * -----------------------------------------
 *
 * This test suite validates that:
 * 1) Any unrestricted or restricted document uploaded to a case is reflected correctly in the ROCA tables.
 * 2) Restricted documents are accessible only to the permitted users/defendants.
 * 3) Multiple Defence Advocates’ uploads are correctly segregated.
 *
 * Test coverage:
 *  - Unrestricted section uploads (HMCTS Admin)
 *  - Restricted section uploads (Defence Advocates A, B, C)
 *
 * Cleanup:
 *  - Cases are dynamically created and deleted to avoid shared state issues.
 *
 * Notes:
 *  - ROCA validation checks both missing and unexpected documents per user.
 *  - Restricted sections require logging in as the appropriate Defence Advocate to simulate access control.
 */

test.describe("@nightly @regression ROCA: Document Audit Validation (Restricted and Unrestricted) @cleanup", () => {
  let newCaseName: string;

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
        "Defence",
      );
      newCaseName = newCase.newCaseName;
    },
  );
  test(`Validate ROCA for unrestricted document uploads`, async ({
    sectionsPage,
    sectionDocumentsPage,
    uploadDocumentPage,
    rocaPage,
    peoplePage,
  }) => {
    await peoplePage.caseNavigation.navigateTo("Sections");
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
      sections.unrestricted,
    );

    // Store uploaded documents for ROCA validation
    const uploadedDocuments: ROCAModel[] = [];

    // Pick up to 3 random sections for upload testing
    const sampleEntries = Object.entries(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Upload unrestricted documents and update expected ROCA model
    for (const [sectionIndex, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadUnrestrictedDocument(
        "unrestrictedSectionUpload",
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
      // Track in local ROCA model for later validation
      await rocaPage.createROCAModelRecord(
        uploadedDocuments,
        sectionIndex,
        "unrestrictedSectionUpload",
        "Create",
        config.users.hmctsAdmin.username,
      );
    }

    // Navigate to ROCA page and validate unrestricted table
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.unrestrictedTable).toBeVisible({ timeout: 30_000 });

    // Compare expected vs actual ROCA
    const expectedROCA = uploadedDocuments;
    const availableROCA = await rocaPage.getDocumentsFromROCATable(
      rocaPage.unrestrictedTable,
    );

    const { missingDocuments, unexpectedDocuments } =
      await rocaPage.compareExpectedVsAvailableROCA(
        expectedROCA,
        availableROCA,
      );

    // Aggregate Results
    const uploadIssues = [...missingDocuments, ...unexpectedDocuments];
    pushTestResult({
      user: config.users.hmctsAdmin.group,
      heading: `ROCA Validation: Upload Unrestricted Document`,
      category: "ROCA",
      issues: uploadIssues,
    });
    // Fail the test if any issues were found
    if (uploadIssues.length > 0) {
      throw new Error(
        `User ${
          config.users.hmctsAdmin.group
        } had issues uploading unrestricted documents:\n${uploadIssues.join(
          "\n",
        )}`,
      );
    }
  });

  test(`Validate ROCA for restricted document uploads`, async ({
    homePage,
    loginPage,
    caseDetailsPage,
    caseSearchPage,
    sectionsPage,
    sectionDocumentsPage,
    uploadDocumentPage,
    rocaPage,
    peoplePage,
  }) => {
    // Increase timeout for multi-user restricted uploads
    test.setTimeout(720000);
    await peoplePage.caseNavigation.navigateTo("Sections");
    const restrictedSectionKeys = await sectionsPage.getSectionKeys(
      sections.restricted,
    );

    const uploadedDocuments: ROCAModel[] = [];

    const sampleEntries = Object.entries(restrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    await peoplePage.navigation.logOff();

    // Upload documents to restricted section as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName,
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    for (const [sectionIndex, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadRestrictedSectionDocument(
        "One, Defendant",
        "restrictedSectionUploadDefendantOne",
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");

      // Update ROCA expected model for Defence Advocate A
      await rocaPage.createROCAModelRecord(
        uploadedDocuments,
        sectionIndex,
        "restrictedSectionUploadDefendantOne",
        "Create",
        config.users.defenceAdvocateA.username,
        "One Defendant",
      );
    }
    await sectionsPage.navigation.logOff();

    // Upload documents to restricted section as Defence Advocate B and validate ROCA
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateB,
      newCaseName,
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    for (const [sectionIndex, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadRestrictedSectionDocument(
        "Two, Defendant",
        "restrictedSectionUploadDefendantTwo",
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");

      // Update ROCA expected model for Defence Advocate B
      await rocaPage.createROCAModelRecord(
        uploadedDocuments,
        sectionIndex,
        "restrictedSectionUploadDefendantTwo",
        "Create",
        config.users.defenceAdvocateB.username,
        "Two Defendant",
      );
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 30_000 });

    // Validate ROCA table filtered for Defence Advocate B documents
    const expectedROCADefenceB = uploadedDocuments.filter((document) =>
      document.defendants!.includes("Two Defendant"),
    );

    const issuesB = await rocaPage.validateROCAForUser(
      expectedROCADefenceB,
      rocaPage.restrictedTable,
    );

    await sectionsPage.navigation.logOff();

    // Validate ROCA as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName,
    );
    await caseDetailsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 30_000 });

    const expectedROCADefenceA = uploadedDocuments.filter((document) =>
      document.defendants!.includes("One Defendant"),
    );
    const issuesA = await rocaPage.validateROCAForUser(
      expectedROCADefenceA,
      rocaPage.restrictedTable,
    );

    await sectionsPage.navigation.logOff();

    // Upload restricted document and validate ROCA as Defence Advocate C
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateC,
      newCaseName,
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    for (const [sectionIndex, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadRestrictedSectionDocument(
        "Two, Defendant",
        "restrictedSectionUploadD1&D2",
        "One, Defendant",
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");

      // Track combined ROCA records
      await rocaPage.createROCAModelRecord(
        uploadedDocuments,
        sectionIndex,
        "restrictedSectionUploadD1&D2",
        "Create",
        config.users.defenceAdvocateC.username,
        "One Defendant, Two Defendant",
      );
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 30_000 });

    // Filter expected ROCA for combined visibility
    const expectedROCADefenceC = uploadedDocuments.filter(
      (document) =>
        document.defendants!.includes("One Defendant") ||
        document.defendants!.includes("Two Defendant") ||
        document.defendants!.includes("One Defendant, Two Defendant"),
    );
    const issuesC = await rocaPage.validateROCAForUser(
      expectedROCADefenceC,
      rocaPage.restrictedTable,
    );
    // Aggregate all ROCA issues across Defence Advocates
    const uploadIssues = [...issuesA, ...issuesB, ...issuesC];
    pushTestResult({
      user: "Defence Users",
      heading: `ROCA Validation: Upload and Access to Restricted Documents`,
      category: "ROCA",
      issues: uploadIssues,
    });
    // Fail the test if any issues were found
    if (uploadIssues.length > 0) {
      throw new Error(
        `Defence Users had issues uploading and accessing restricted documents:\n${uploadIssues.join(
          "\n",
        )}`,
      );
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
