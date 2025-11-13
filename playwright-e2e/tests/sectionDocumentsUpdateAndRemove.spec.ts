import { test, expect } from "../fixtures";
import { config, assertNoIssues } from "../utils";
import {
  createNewCaseWithUnrestrictedDocuments,
  createNewCaseWithRestrictedDocuments,
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

test.describe("Unrestricted Document Update and Removal Tests", () => {
  let sampleKeys: [string, string][];
  let newCaseName: string;
  const unrestrictedRemoveResults: { section: string; issues: string[] }[] = [];
  const unrestrictedMoveResults: { section: string; issues: string[] }[] = [];
  const unrestrictedEditResults: { section: string; issues: string[] }[] = [];

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
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();

      const newCase = await createNewCaseWithUnrestrictedDocuments(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        sectionsPage,
        sectionDocumentsPage,
        "TestCase",
        "TestURN"
      );
      sampleKeys = newCase.sampleKeys as [string, string][];
      newCaseName = newCase.newCaseName;
    }
  );

  test(`Validate document removal in unrestricted sections for user: HMCTS Admin`, async ({
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
  }) => {
    for (const [section, key] of sampleKeys) {
      await sectionsPage.goToUpdateDocuments(key);
      await updateDocumentsPage.removeDocument();
      await updateDocumentsPage.sectionDocumentsBtn.click();
      const removeIssues = await sectionDocumentsPage.verifyDocumentRemoval(
        "HMCTSAdmin",
        section
      );
      if (removeIssues) {
        unrestrictedRemoveResults.push({
          section: section,
          issues: [removeIssues],
        });
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Results Summary
    const unrestrictedRemoveCheck = unrestrictedRemoveResults.map((r) => ({
      label: r.section,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      unrestrictedRemoveCheck,
      "UNRESTRICTED SECTION DOCUMENT REMOVAL SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });

  test(`Validate document move in unrestricted sections for user: HMCTS Admin`, async ({
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
  }) => {
    const newSections: string[] = [];

    for (const [section, key] of sampleKeys) {
      await sectionsPage.goToUpdateDocuments(key);
      const newSection = await updateDocumentsPage.moveDocument(
        sampleKeys,
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
        unrestrictedMoveResults.push({
          section: section,
          issues: [moveIssues],
        });
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Results Summary
    const unrestrictedMoveCheck = unrestrictedMoveResults.map((r) => ({
      label: r.section,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      unrestrictedMoveCheck,
      "UNRESTRICTED SECTION DOCUMENT MOVE SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });

  test(`Validate document edit in unrestricted sections for user: HMCTS Admin`, async ({
    sectionsPage,
    sectionDocumentsPage,
    updateDocumentsPage,
  }) => {
    for (const [section, key] of sampleKeys) {
      await sectionsPage.goToUpdateDocuments(key);
      await updateDocumentsPage.editDocumentName();
      await updateDocumentsPage.sectionDocumentsBtn.click();
      const editIssues =
        await sectionDocumentsPage.validateUnrestrictedSectionDocument(
          "TestEdit",
          section
        );
      if (editIssues) {
        unrestrictedEditResults.push({
          section: section,
          issues: [editIssues],
        });
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Results Summary
    const unrestrictedEditCheck = unrestrictedEditResults.map((r) => ({
      label: r.section,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      unrestrictedEditCheck,
      "UNRESTRICTED SECTION DOCUMENT EDIT SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });

  test.afterEach(
    async ({ page, caseSearchPage, caseDetailsPage, homePage, loginPage }) => {
      if (newCaseName) {
        await deleteCaseByName(
          newCaseName,
          caseSearchPage,
          caseDetailsPage,
          homePage,
          loginPage,
          page
        );
      }
    }
  );
});

// ============================================================
// Test 2: Update and Remove Restricted Section Documents
// ============================================================

// As a user
// I want to be able to update or remove a document in an restricted section
// So that only relevant documents are available in the correct sections for further review for relevant parties

test.describe("Restricted Document Update and Removal Tests", () => {
  let sampleKeys: [string, string][];
  let newCaseName: string;
  const restrictedRemoveResults: { section: string; issues: string[] }[] = [];
  const restrictedMoveResults: { section: string; issues: string[] }[] = [];
  const restrictedEditResults: { section: string; issues: string[] }[] = [];

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
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();

      const newCase = await createNewCaseWithRestrictedDocuments(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        sectionsPage,
        sectionDocumentsPage,
        "TestCase",
        "TestURN"
      );
      sampleKeys = newCase.sampleKeys as [string, string][];
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
    for (const [section, key] of sampleKeys) {
      await sectionsPage.goToUpdateDocuments(key);
      await updateDocumentsPage.removeDocument();
      await updateDocumentsPage.sectionDocumentsBtn.click();
      const removeIssues = await sectionDocumentsPage.verifyDocumentRemoval(
        "Defence Advocate A",
        section
      );
      if (removeIssues) {
        restrictedRemoveResults.push({
          section: section,
          issues: [removeIssues],
        });
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Results Summary
    const restrictedRemoveCheck = restrictedRemoveResults.map((r) => ({
      label: r.section,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      restrictedRemoveCheck,
      "RESTRICTED SECTION DOCUMENT REMOVAL SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
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
    for (const [section, key] of sampleKeys) {
      await sectionsPage.goToUpdateDocuments(key);
      const randomSection = await updateDocumentsPage.moveDocument(
        sampleKeys,
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
        restrictedMoveResults.push({
          section: section,
          issues: [moveIssues],
        });
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Results Summary
    const restrictedMoveCheck = restrictedMoveResults.map((r) => ({
      label: r.section,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      restrictedMoveCheck,
      "RESTRICTED SECTION DOCUMENT MOVE SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
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
    for (const [section, key] of sampleKeys) {
      await sectionsPage.goToUpdateDocuments(key);
      await updateDocumentsPage.editDocumentName();
      await updateDocumentsPage.sectionDocumentsBtn.click();
      const editIssues =
        await sectionDocumentsPage.validateSingleRestrictedSectionDocument(
          "TestEdit",
          section
        );
      if (editIssues) {
        restrictedEditResults.push({
          section: section,
          issues: [editIssues],
        });
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Results Summary
    const restrictedEditCheck = restrictedEditResults.map((r) => ({
      label: r.section,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      restrictedEditCheck,
      "RESTRICTED SECTION DOCUMENT EDIT SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });

  test.afterEach(
    async ({ page, caseSearchPage, caseDetailsPage, homePage, loginPage }) => {
      if (newCaseName) {
        await deleteCaseByName(
          newCaseName,
          caseSearchPage,
          caseDetailsPage,
          homePage,
          loginPage,
          page
        );
      }
    }
  );
});
