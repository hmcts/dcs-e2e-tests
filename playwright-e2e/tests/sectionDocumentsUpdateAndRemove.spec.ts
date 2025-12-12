import { test } from "../fixtures";
import { config, pushTestResult } from "../utils";
import {
  createNewCaseWithUnrestrictedDocument,
  createNewCaseWithRestrictedDocument,
} from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import { deleteCaseByName } from "../helpers/deleteCase.helper";
import { verifyDocumentMove } from "../helpers/sectionDocuments.helper";

// ============================================================
// Test 1: Update and Remove Unrestricted Section Documents
// ============================================================

// As a user
// I want to be able to update or remove a document in an unrestricted section
// So that only relevant documents are available in the correct sections for further review for relevant parties

test.describe("Unrestricted Document Update and Removal Tests @cleanup", () => {
  let sampleKey: [string, string][];
  let newCaseName: string;
  const unrestrictedRemoveResults: string[] = [];
  const unrestrictedMoveResults: string[] = [];
  const unrestrictedEditResults: string[] = [];

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
    }
  );

  test(`Validate document removal in unrestricted sections for user: HMCTS Admin`, async ({
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
  }) => {
    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      await updateDocumentsPage.removeDocument();
      await updateDocumentsPage.sectionDocumentsBtn.click();
      const removeIssues = await sectionDocumentsPage.verifyDocumentRemoval(
        "HMCTSAdmin",
        section
      );
      if (removeIssues) {
        unrestrictedRemoveResults.push(removeIssues);
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Aggragate Results
    pushTestResult({
      user: config.users.hmctsAdmin.group,
      heading: `Section Validation: Delete Unrestricted Document`,
      category: "Sections",
      issues: unrestrictedRemoveResults,
    });
    // Fail the test if any issues were found
    if (unrestrictedRemoveResults.length > 0) {
      throw new Error(
        `User ${
          config.users.hmctsAdmin.group
        } experienced issues deleting an unrestricted document:\n${unrestrictedRemoveResults.join(
          "\n"
        )}`
      );
    }
  });

  test(`Validate document move in unrestricted sections for user: HMCTS Admin`, async ({
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
  }) => {
    const newSections: string[] = [];

    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      const newSection = await updateDocumentsPage.moveDocument(
        sampleKey,
        newSections
      );
      await updateDocumentsPage.sectionDocumentsBtn.click();

      const moveIssues = await verifyDocumentMove(
        "HMCTSAdmin",
        section,
        newSection,
        "unrestrictedSectionUpload",
        sectionDocumentsPage,
        sectionsPage
      );
      if (moveIssues) {
        unrestrictedMoveResults.push(moveIssues);
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Aggragate Results
    pushTestResult({
      user: config.users.hmctsAdmin.group,
      heading: `Section Validation: Move Unrestricted Document`,
      category: "Sections",
      issues: unrestrictedMoveResults,
    });
    // Fail the test if any issues were found
    if (unrestrictedMoveResults.length > 0) {
      throw new Error(
        `User ${
          config.users.hmctsAdmin.group
        } experienced issues moving unrestricted document:\n${unrestrictedMoveResults.join(
          "\n"
        )}`
      );
    }
  });

  test(`Validate document edit in unrestricted sections for user: HMCTS Admin`, async ({
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
  }) => {
    for (const [section, key] of sampleKey) {
      await sectionsPage.goToUpdateDocuments(key);
      await updateDocumentsPage.editDocumentName();
      await updateDocumentsPage.sectionDocumentsBtn.click();
      const editIssues =
        await sectionDocumentsPage.validateUnrestrictedSectionDocument(
          "TestEdit",
          section
        );
      if (editIssues) {
        unrestrictedEditResults.push(editIssues);
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Aggragate Results
    pushTestResult({
      user: config.users.hmctsAdmin.group,
      heading: `Section Validation: Edit Unrestricted Document`,
      category: "Sections",
      issues: unrestrictedEditResults,
    });
    // Fail the test if any issues were found
    if (unrestrictedEditResults.length > 0) {
      throw new Error(
        `User ${
          config.users.hmctsAdmin.group
        } experienced issues editing unrestricted document:\n${unrestrictedEditResults.join(
          "\n"
        )}`
      );
    }
  });

  test.afterEach(async () => {
    if (!newCaseName) return;

    try {
      console.log(`Attempting to delete test case: ${newCaseName}`);

      // Run cleanup with timeout
      await Promise.race([
        deleteCaseByName(newCaseName, 180000),
        new Promise<void>((resolve) =>
          setTimeout(() => {
            console.warn(
              `⚠️ Cleanup for ${newCaseName} timed out after 3 minutes`
            );
            resolve();
          }, 180000)
        ),
      ]);
    } catch (err) {
      console.warn(`⚠️ Cleanup failed for ${newCaseName}:`, err);
    }
  });
});

// ============================================================
// Test 2: Update and Remove Restricted Section Documents
// ============================================================

// As a user
// I want to be able to update or remove a document in an restricted section
// So that only relevant documents are available in the correct sections for further review for relevant parties

test.describe("Restricted Document Update and Removal Tests @cleanup", () => {
  let sampleKey: [string, string][];
  let newCaseName: string;
  const restrictedRemoveResults: string[] = [];
  const restrictedMoveResults: string[] = [];
  const restrictedEditResults: string[] = [];

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
    }
  );

  test(`Validate document removal in restricted sections for user: Defence Advocate A`, async ({
    homePage,
    loginPage,
    caseSearchPage,
    sectionsPage,
    caseDetailsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
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
      await updateDocumentsPage.removeDocument();
      await updateDocumentsPage.sectionDocumentsBtn.click();
      const removeIssues = await sectionDocumentsPage.verifyDocumentRemoval(
        "Defence Advocate A",
        section
      );
      if (removeIssues) {
        restrictedRemoveResults.push(removeIssues);
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Aggragate Results
    pushTestResult({
      user: config.users.defenceAdvocateA.group,
      heading: `Section Validation: Delete Restricted Document`,
      category: "Sections",
      issues: restrictedRemoveResults,
    });
    // Fail the test if any issues were found
    if (restrictedRemoveResults.length > 0) {
      throw new Error(
        `User ${
          config.users.defenceAdvocateA.group
        } experienced issues deleting restricted document:\n${restrictedRemoveResults.join(
          "\n"
        )}`
      );
    }
  });

  test(`Validate document move from restricted sections`, async ({
    homePage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
  }) => {
    const newSections: string[] = [];

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
      const randomSection = await updateDocumentsPage.moveDocument(
        sampleKey,
        newSections
      );
      await updateDocumentsPage.sectionDocumentsBtn.click();

      const moveIssues = await verifyDocumentMove(
        "Defence Advocate A",
        section,
        randomSection,
        "restrictedSectionUploadDefendantOne",
        sectionDocumentsPage,
        sectionsPage
      );
      if (moveIssues) {
        restrictedMoveResults.push(moveIssues);
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Aggragate Results
    pushTestResult({
      user: config.users.defenceAdvocateA.group,
      heading: `Section Validation: Move Restricted Document`,
      category: "Sections",
      issues: restrictedMoveResults,
    });
    // Fail the test if any issues were found
    if (restrictedMoveResults.length > 0) {
      throw new Error(
        `User ${
          config.users.defenceAdvocateA.group
        } experienced issues moving restricted document:\n${restrictedMoveResults.join(
          "\n"
        )}`
      );
    }
  });

  test(`Validate document edit in restricted sections`, async ({
    homePage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
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
      await updateDocumentsPage.editDocumentName();
      await updateDocumentsPage.sectionDocumentsBtn.click();
      const editIssues =
        await sectionDocumentsPage.validateSingleRestrictedSectionDocument(
          "TestEdit",
          section
        );
      if (editIssues) {
        restrictedEditResults.push(editIssues);
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Aggragate Results
    pushTestResult({
      user: config.users.defenceAdvocateC.group,
      heading: `Section Validation: Edit Restricted Document`,
      category: "Sections",
      issues: restrictedEditResults,
    });
    // Fail the test if any issues were found
    if (restrictedEditResults.length > 0) {
      throw new Error(
        `User ${
          config.users.defenceAdvocateC.group
        } experienced issues editing restricted document:\n${restrictedEditResults.join(
          "\n"
        )}`
      );
    }
  });

  test.afterEach(async () => {
    if (!newCaseName) return;

    try {
      console.log(`Attempting to delete test case: ${newCaseName}`);

      // Run cleanup with timeout
      await Promise.race([
        deleteCaseByName(newCaseName, 180000),
        new Promise<void>((resolve) =>
          setTimeout(() => {
            console.warn(
              `⚠️ Cleanup for ${newCaseName} timed out after 3 minutes`
            );
            resolve();
          }, 180000)
        ),
      ]);
    } catch (err) {
      console.warn(`⚠️ Cleanup failed for ${newCaseName}:`, err);
    }
  });
});
