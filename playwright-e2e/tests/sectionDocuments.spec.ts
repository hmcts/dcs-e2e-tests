import { test, expect } from "../fixtures";
import { sections, config, assertNoIssues } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import { uploadAndValidateRestrictedDocumentUpload } from "../helpers/sectionDocuments.helper";

// ============================================================
// Test 1: Upload Unrestricted Section Documents
// ============================================================

// As a user
// I want to be able to upload a document to an unrestricted section
// So that this is added to the case for further review for all parties

test.describe("Document Upload Tests", () => {
  let newCaseName: string;
  const unrestrictedUploadResults: { section: string; issues: string[] }[] = [];
  const restrictedUploadResults: {
    user: string;
    issues: string[];
  }[] = [];

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
        "TestURN"
      );
      newCaseName = newCase.newCaseName;
    }
  );

  test(`Validate document upload to unrestricted sections for user: HMCTS Admin`, async ({
    sectionsPage,
    sectionDocumentsPage,
  }) => {
    const unrestrictedSections = sections.unrestricted;
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
      unrestrictedSections
    );
    const sampleEntries = Object.entries(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    for (const [section, key] of sampleEntries) {
      const uploadIssues =
        await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
          key,
          "unrestrictedSectionUpload",
          section
        );
      if (uploadIssues) {
        unrestrictedUploadResults.push({
          section: section,
          issues: [uploadIssues],
        });
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
  });

  //Results Summary
  test.afterAll(() => {
    const unrestrictedDocumentsCheck = unrestrictedUploadResults.map((r) => ({
      label: r.section,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      unrestrictedDocumentsCheck,
      "UNRESTRICTED SECTION DOCUMENT VALIDATION SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });

  // ============================================================
  // Test 2: Upload Restricted Section Documents
  // ============================================================

  // As a user
  // I want to be able to upload a document to a restricted section pertaining to a single defendant
  // So that only the relevant Defence lawyer for that defendant can see the document

  test(`Upload of restricted section documents and validation of Defence User access`, async ({
    loginPage,
    homePage,
    caseDetailsPage,
    sectionsPage,
    sectionDocumentsPage,
  }) => {
    const restrictedSections = sections.restricted;
    await sectionsPage.navigation.navigateTo("LogOff");

    // Upload documents to restricted section as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseDetailsPage,
      config.users.defenceAdvocateA,
      newCaseName
    );

    const restrictedSectionKeys = await sectionsPage.getSectionKeys(
      restrictedSections
    );
    const sampleEntries = Object.entries(restrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    await uploadAndValidateRestrictedDocumentUpload(
      config.users.defenceAdvocateA.group,
      sampleEntries,
      [{ name: "restrictedSectionUploadDefendantOne", shouldBeVisible: true }],
      restrictedUploadResults,
      sectionsPage,
      sectionDocumentsPage,
      "restrictedSectionUploadDefendantOne",
      "One, Defendant"
    );

    //   Upload documents to restricted section as Defence Advocate B
    //   and validate no access to documents Uploaded by Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseDetailsPage,
      config.users.defenceAdvocateB,
      newCaseName
    );

    await uploadAndValidateRestrictedDocumentUpload(
      config.users.defenceAdvocateB.group,
      sampleEntries,
      [
        { name: "restrictedSectionUploadDefendantOne", shouldBeVisible: false },
        { name: "restrictedSectionUploadDefendantTwo", shouldBeVisible: true },
      ],
      restrictedUploadResults,
      sectionsPage,
      sectionDocumentsPage,
      "restrictedSectionUploadDefendantTwo",
      "Two, Defendant"
    );

    //   Validate access to both Defendant One and Defendant Two's documents as Defence Advocate C
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseDetailsPage,
      config.users.defenceAdvocateC,
      newCaseName
    );
    await uploadAndValidateRestrictedDocumentUpload(
      config.users.defenceAdvocateC.group,
      sampleEntries,
      [
        { name: "restrictedSectionUploadDefendantOne", shouldBeVisible: true },
        { name: "restrictedSectionUploadDefendantTwo", shouldBeVisible: true },
      ],
      restrictedUploadResults,
      sectionsPage,
      sectionDocumentsPage
    );

    //   Re-validate access to only Defendant One documents as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseDetailsPage,
      config.users.defenceAdvocateA,
      newCaseName
    );
    await uploadAndValidateRestrictedDocumentUpload(
      config.users.defenceAdvocateA.group,
      sampleEntries,
      [
        { name: "restrictedSectionUploadDefendantOne", shouldBeVisible: true },
        { name: "restrictedSectionUploadDefendantTwo", shouldBeVisible: false },
      ],
      restrictedUploadResults,
      sectionsPage,
      sectionDocumentsPage
    );
  });

  test.afterAll(() => {
    const restrictedDocumentsCheck = restrictedUploadResults.map((r) => ({
      label: r.user,
      issues: r.issues,
    }));
    const { summaryLines, anyIssues } = assertNoIssues(
      restrictedDocumentsCheck,
      "RESTRICTED SECTION DOCUMENT VALIDATION SUMMARY"
    );
    if (anyIssues) {
      const message = ["Issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });
});
