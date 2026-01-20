import { test } from "../fixtures";
import { sections, config, pushTestResult } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import { uploadAndValidateRestrictedDocumentUpload } from "../helpers/sectionDocuments.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";

// ============================================================
// Test 1: Upload Unrestricted Section Documents
// ============================================================

// As a user
// I want to be able to upload a document to an unrestricted section
// So that this is added to the case for further review for all parties

test.describe("Document Upload Tests @cleanup", () => {
  let newCaseName: string;
  const unrestrictedUploadResults: string[] = [];
  const restrictedUploadResults: string[] = [];

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

  test(`Validate document upload to unrestricted sections for user: HMCTS Admin`, async ({
    sectionsPage,
    sectionDocumentsPage,
    peoplePage,
  }) => {
    await peoplePage.caseNavigation.navigateTo("Sections");
    const unrestrictedSections = sections.unrestricted;
    const unrestrictedSectionKeys =
      await sectionsPage.getSectionKeys(unrestrictedSections);
    const sampleEntries = Object.entries(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    for (const [section, key] of sampleEntries) {
      const uploadIssues =
        await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
          key,
          "unrestrictedSectionUpload",
          section,
        );
      if (uploadIssues) {
        unrestrictedUploadResults.push(uploadIssues);
      }
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    // Aggragate Results
    pushTestResult({
      user: config.users.hmctsAdmin.group,
      heading: `Section Validation: Upload Unrestricted Document`,
      category: "Sections",
      issues: unrestrictedUploadResults,
    });
    // Fail the test if any issues were found
    if (unrestrictedUploadResults.length > 0) {
      throw new Error(
        `User ${
          config.users.hmctsAdmin.group
        } experienced issues uploading unrestricted documents:\n${unrestrictedUploadResults.join(
          "\n",
        )}`,
      );
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
    caseSearchPage,
    sectionsPage,
    sectionDocumentsPage,
    peoplePage,
  }) => {
    const restrictedSections = sections.restricted;
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
    const restrictedSectionKeys =
      await sectionsPage.getSectionKeys(restrictedSections);
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
      "One, Defendant",
    );

    //   Upload documents to restricted section as Defence Advocate B
    //   and validate no access to documents Uploaded by Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateB,
      newCaseName,
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
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
      "Two, Defendant",
    );

    //   Validate access to both Defendant One and Defendant Two's documents as Defence Advocate C
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateC,
      newCaseName,
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    await uploadAndValidateRestrictedDocumentUpload(
      config.users.defenceAdvocateC.group,
      sampleEntries,
      [
        { name: "restrictedSectionUploadDefendantOne", shouldBeVisible: true },
        { name: "restrictedSectionUploadDefendantTwo", shouldBeVisible: true },
      ],
      restrictedUploadResults,
      sectionsPage,
      sectionDocumentsPage,
    );

    //   Re-validate access to only Defendant One documents as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName,
    );
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    await uploadAndValidateRestrictedDocumentUpload(
      config.users.defenceAdvocateA.group,
      sampleEntries,
      [{ name: "restrictedSectionUploadDefendantTwo", shouldBeVisible: false }],
      restrictedUploadResults,
      sectionsPage,
      sectionDocumentsPage,
    );
    // Aggragate Results
    pushTestResult({
      user: "Defence Users",
      heading: `Section Validation: Upload and Access Restricted Document`,
      category: "Sections",
      issues: restrictedUploadResults,
    });
    // Fail the test if any issues were found
    if (restrictedUploadResults.length > 0) {
      throw new Error(
        `Defence Users experienced issues uploading and accessing restricted documents:\n${restrictedUploadResults.join(
          "\n",
        )}`,
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
