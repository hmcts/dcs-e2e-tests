import { test, expect } from "../fixtures";
import { config, pushTestResult } from "../utils";
import {
  createNewCaseWithUnrestrictedDocument,
  createNewCaseWithRestrictedDocument,
} from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";
import { ROCAModel } from "../data/ROCAModel";

// ======================================================================
// Test 1: ROCA Validation of Unrestricted Document Updates or Removal
// ======================================================================

// As a user
// I want any updates or removal of unrestricted documents to be reflected in the ROCA unrestricted table
// So that I can accurately track document activity

test.describe("ROCA: Document Update Audit Validation (Unrestricted) @cleanup", () => {
  let sampleKey: [string, string][];
  let newCaseName: string;
  let rocaExpected: ROCAModel[] = [];

  test.beforeEach(
    async ({
      homePage,
      caseSearchPage,
      caseDetailsPage,
      createCasePage,
      addDefendantPage,
      peoplePage,
      sectionsPage,
      sectionDocumentsPage,
      rocaPage,
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();

      const newCase = await createNewCaseWithUnrestrictedDocument(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        sectionsPage,
        sectionDocumentsPage,
        rocaPage,
        "TestCase",
        "TestURN",
        "Defence"
      );
      sampleKey = newCase.sampleKey as [string, string][];
      newCaseName = newCase.newCaseName;
      rocaExpected = newCase.uploadedDocuments;
    }
  );

  test(`Validate ROCA: Document removal in unrestricted sections`, async ({
    rocaPage,
    sectionsPage,
    updateDocumentsPage,
  }) => {
    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      await rocaPage.updateROCAModel(
        rocaExpected,
        section,
        "unrestrictedSectionUpload",
        "Delete",
        config.users.hmctsAdmin.username
      );
      await updateDocumentsPage.removeDocument();
      await updateDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.unrestrictedTable).toBeVisible({ timeout: 30_000 });

    // Compare expected vs actual ROCA
    const deletionIssues = await rocaPage.validateROCAForUser(
      rocaExpected,
      rocaPage.unrestrictedTable
    );
    // Aggragate Results
    pushTestResult({
      user: config.users.hmctsAdmin.group,
      heading: `ROCA Validation: Delete Unrestricted Document`,
      category: "ROCA",
      issues: deletionIssues,
    });
    // Fail the test if any issues were found
    if (deletionIssues.length > 0) {
      throw new Error(
        `User ${
          config.users.hmctsAdmin.group
        } had issues deleting unrestricted document:\n${deletionIssues.join(
          "\n"
        )}`
      );
    }
  });

  test(`Validate ROCA: Moving a document from an unrestricted section`, async ({
    sectionsPage,
    rocaPage,
    updateDocumentsPage,
  }) => {
    const newSections: string[] = [];
    const restrictedROCAModel: ROCAModel[] = [];

    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      const newSection = await updateDocumentsPage.moveDocument(
        sampleKey,
        newSections
      );
      await rocaPage.updateROCAModelMove(
        rocaExpected,
        section,
        newSection,
        "unrestrictedSectionUpload",
        config.users.hmctsAdmin.username,
        restrictedROCAModel,
        false
      );
      await updateDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.unrestrictedTable).toBeVisible({ timeout: 30_000 });

    const expectedUnrestrictedROCA = rocaExpected;
    const unrestrictedResult = await rocaPage.validateROCAForUser(
      expectedUnrestrictedROCA,
      rocaPage.unrestrictedTable
    );

    const expectedRestrictedROCA = restrictedROCAModel;
    const restrictedResult = await rocaPage.validateROCAForUser(
      expectedRestrictedROCA,
      rocaPage.restrictedTable
    );
    // Aggragate Results
    const moveIssues = [...unrestrictedResult, ...restrictedResult];
    pushTestResult({
      user: config.users.hmctsAdmin.group,
      heading: `ROCA Validation: Move Unrestricted Document`,
      category: "ROCA",
      issues: moveIssues,
    });
    // Fail the test if any issues were found;
    if (moveIssues.length > 0) {
      throw new Error(
        `User ${
          config.users.hmctsAdmin.group
        } had issues moving unrestricted document:\n${moveIssues.join("\n")}`
      );
    }
  });

  test(`Validate document edit in unrestricted sections for user: HMCTS Admin`, async ({
    rocaPage,
    sectionsPage,
    updateDocumentsPage,
  }) => {
    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      await rocaPage.updateROCAModel(
        rocaExpected,
        section,
        "unrestrictedSectionUpload",
        "Update",
        config.users.hmctsAdmin.username
      );
      await updateDocumentsPage.editDocumentName();
      await updateDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.unrestrictedTable).toBeVisible({ timeout: 30_000 });

    // Compare expected vs actual ROCA
    const editIssues = await rocaPage.validateROCAForUser(
      rocaExpected,
      rocaPage.unrestrictedTable
    );

    // Aggragate Results
    pushTestResult({
      user: config.users.hmctsAdmin.group,
      heading: `ROCA Validation: Edit Unrestricted Document`,
      category: "ROCA",
      issues: editIssues,
    });
    // Fail the test if any issues were found
    if (editIssues.length > 0) {
      throw new Error(
        `User ${
          config.users.hmctsAdmin.group
        } had issues editing unrestricted document:\n${editIssues.join("\n")}`
      );
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

// ============================================================
// Test 2: Update and Remove Restricted Section Documents
// ============================================================

// As a user
// I want any updates or removal of restricted documents to be reflected in the ROCA restricted table
// So that I can accurately track document activity

test.describe("ROCA: Document Update Audit Validation (Restricted) @cleanup", () => {
  let sampleKey: [string, string][];
  let newCaseName: string;
  let rocaExpected: ROCAModel[] = [];

  test.beforeEach(
    async ({
      homePage,
      caseSearchPage,
      caseDetailsPage,
      createCasePage,
      addDefendantPage,
      peoplePage,
      sectionsPage,
      sectionDocumentsPage,
      rocaPage,
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();

      const newCase = await createNewCaseWithRestrictedDocument(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        sectionsPage,
        sectionDocumentsPage,
        rocaPage,
        "TestCase",
        "TestURN",
        "Defence"
      );
      sampleKey = newCase.sampleKey as [string, string][];
      newCaseName = newCase.newCaseName;
      rocaExpected = newCase.uploadedDocuments;
    }
  );

  test(`Validate document removal in restricted sections`, async ({
    homePage,
    loginPage,
    caseSearchPage,
    sectionsPage,
    caseDetailsPage,
    updateDocumentsPage,
    rocaPage,
  }) => {
    await sectionsPage.navigation.navigateTo("LogOff");

    // Remove documents in restricted sections as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      await rocaPage.updateROCAModel(
        rocaExpected,
        section,
        "restrictedSectionUploadDefendantOne",
        "Delete",
        config.users.defenceAdvocateA.username,
        "One Defendant"
      );
      await updateDocumentsPage.removeDocument();
      await updateDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 60_000 });

    // Compare expected vs actual ROCA
    const deletionIssues = await rocaPage.validateROCAForUser(
      rocaExpected,
      rocaPage.restrictedTable
    );

    // Aggragate Results
    pushTestResult({
      user: config.users.defenceAdvocateA.group,
      heading: `ROCA Validation: Delete Restricted Document`,
      category: "ROCA",
      issues: deletionIssues,
    });
    // Fail the test if any issues were found
    if (deletionIssues.length > 0) {
      throw new Error(
        `User ${
          config.users.defenceAdvocateA.group
        } had issues deleting restricted document:\n${deletionIssues.join(
          "\n"
        )}`
      );
    }
  });

  test(`ROCA - Validate document move from restricted sections`, async ({
    homePage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    sectionsPage,
    updateDocumentsPage,
    rocaPage,
  }) => {
    const newSections: string[] = [];
    const unrestrictedROCAModel: ROCAModel[] = [];

    await sectionsPage.navigation.navigateTo("LogOff");

    // Move documents from restricted sections to either a restricted or unrestricted section as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      const newSection = await updateDocumentsPage.moveDocument(
        sampleKey,
        newSections
      );
      await rocaPage.updateROCAModelMove(
        rocaExpected,
        section,
        newSection,
        "restrictedSectionUploadDefendantOne",
        config.users.defenceAdvocateA.username,
        unrestrictedROCAModel,
        true,
        "One Defendant"
      );
      await updateDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 30_000 });

    const expectedRestrictedROCA = rocaExpected;
    const restrictedResult = await rocaPage.validateROCAForUser(
      expectedRestrictedROCA,
      rocaPage.restrictedTable
    );

    const expectedUnrestrictedROCA = unrestrictedROCAModel;
    const unrestrictedResult = await rocaPage.validateROCAForUser(
      expectedUnrestrictedROCA,
      rocaPage.unrestrictedTable
    );

    // Aggragate Results
    const moveIssues = [...unrestrictedResult, ...restrictedResult];
    pushTestResult({
      user: config.users.defenceAdvocateA.group,
      heading: `ROCA Validation: Move Restricted Document`,
      category: "ROCA",
      issues: moveIssues,
    });
    // Fail the test if any issues were found;
    if (moveIssues.length > 0) {
      throw new Error(
        `User ${
          config.users.defenceAdvocateA.group
        } had issues moving restricted document:\n${moveIssues.join("\n")}`
      );
    }
  });

  test(`ROCA - Validate document edit in restricted sections`, async ({
    homePage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
    rocaPage,
  }) => {
    await sectionsPage.navigation.navigateTo("LogOff");

    // Edit documents in restricted sections as Defence Advocate C
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateC,
      newCaseName
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      await rocaPage.updateROCAModel(
        rocaExpected,
        section,
        "restrictedSectionUploadDefendantOne",
        "Update",
        config.users.defenceAdvocateC.username,
        "One Defendant"
      );
      await updateDocumentsPage.editDocumentName();
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 30_000 });

    // Compare expected vs actual ROCA
    const editIssues = await rocaPage.validateROCAForUser(
      rocaExpected,
      rocaPage.restrictedTable
    );

    // Aggragate Results
    pushTestResult({
      user: config.users.defenceAdvocateC.group,
      heading: `ROCA Validation: Edit Restricted Document`,
      category: "ROCA",
      issues: editIssues,
    });
    // Fail the test if any issues were found
    if (editIssues.length > 0) {
      throw new Error(
        `User ${
          config.users.defenceAdvocateC.group
        } had issues editing restricted document:\n${editIssues.join("\n")}`
      );
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
