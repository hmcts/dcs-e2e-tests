import { test, expect } from "../fixtures";
import { ROCAModel } from "../data/ROCAModel";
import { config } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { assertNoIssues } from "../utils";
import { sections } from "../utils";
import { loginAndOpenCase } from "../helpers/login.helper";

test.describe("ROCA Page", () => {
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
        "TestURN"
      );
      newCaseName = newCase.newCaseName;
    }
  );
  test(`Validate ROCA for unrestricted document uploads`, async ({
    sectionsPage,
    sectionDocumentsPage,
    uploadDocumentPage,
    rocaPage,
  }) => {
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
      sections.unrestricted
    );

    const uploadedDocuments: ROCAModel[] = [];

    const sampleEntries = Object.entries(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    for (const [sectionIndex, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadUnrestrictedDocument(
        "unrestrictedSectionUpload"
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
      await rocaPage.createROCAModelRecord(
        uploadedDocuments,
        sectionIndex,
        "unrestrictedSectionUpload",
        "Create",
        config.users.hmctsAdmin.username
      );
    }

    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.unrestrictedTable).toBeVisible();

    // Compare expected vs actual ROCA
    const expectedROCA = uploadedDocuments;
    const availableROCA = await rocaPage.getDocumentsFromROCATable(
      rocaPage.unrestrictedTable
    );

    const { missingDocuments, unexpectedDocuments } =
      await rocaPage.compareExpectedVsAvailableROCA(
        expectedROCA,
        availableROCA
      );

    //Results summary
    const { summaryLines, anyIssues } = assertNoIssues(
      [
        {
          label: "Unrestricted ROCA",
          issues: [...missingDocuments, ...unexpectedDocuments],
        },
      ],
      "Unrestricted ROCA Validation"
    );
    if (anyIssues) {
      const message = ["ROCA issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
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
  }) => {
    const restrictedSectionKeys = await sectionsPage.getSectionKeys(
      sections.restricted
    );

    const uploadedDocuments: ROCAModel[] = [];

    const sampleEntries = Object.entries(restrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    await sectionsPage.navigation.navigateTo("LogOff");

    // Upload documents to restricted section as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseDetailsPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName
    );

    for (const [sectionIndex, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadRestrictedSectionDocument(
        "One, Defendant",
        "restrictedSectionUploadDefendantOne"
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
      await rocaPage.createROCAModelRecord(
        uploadedDocuments,
        sectionIndex,
        "restrictedSectionUploadDefendantOne",
        "Create",
        config.users.defenceAdvocateA.username,
        "One Defendant"
      );
    }

    await sectionsPage.navigation.navigateTo("LogOff");

    // Upload documents to restricted section as Defence Advocate B and validate ROCA
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseDetailsPage,
      caseSearchPage,
      config.users.defenceAdvocateB,
      newCaseName
    );

    for (const [sectionIndex, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadRestrictedSectionDocument(
        "Two, Defendant",
        "restrictedSectionUploadDefendantTwo"
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
      await rocaPage.createROCAModelRecord(
        uploadedDocuments,
        sectionIndex,
        "restrictedSectionUploadDefendantTwo",
        "Create",
        config.users.defenceAdvocateB.username,
        "Two Defendant"
      );
    }

    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 30_000 });

    const expectedROCADefenceB = uploadedDocuments.filter((document) =>
      document.defendants!.includes("Two Defendant")
    );
    console.log("expected", expectedROCADefenceB);

    const issuesB = await rocaPage.validateROCAForUser(
      expectedROCADefenceB,
      rocaPage.restrictedTable
    );

    await sectionsPage.navigation.navigateTo("LogOff");

    // Validate ROCA as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseDetailsPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName
    );
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 30_000 });

    const expectedROCADefenceA = uploadedDocuments.filter((document) =>
      document.defendants!.includes("One Defendant")
    );
    console.log("expected", expectedROCADefenceA);
    const issuesA = await rocaPage.validateROCAForUser(
      expectedROCADefenceA,
      rocaPage.restrictedTable
    );

    await sectionsPage.navigation.navigateTo("LogOff");

    // Upload restricted document and validate ROCA as Defence Advocate C
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseDetailsPage,
      caseSearchPage,
      config.users.defenceAdvocateC,
      newCaseName
    );

    for (const [sectionIndex, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadRestrictedSectionDocument(
        "Two, Defendant",
        "restrictedSectionUploadD1&D2",
        "One, Defendant"
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
      await rocaPage.createROCAModelRecord(
        uploadedDocuments,
        sectionIndex,
        "restrictedSectionUploadD1&D2",
        "Create",
        config.users.defenceAdvocateC.username,
        "One Defendant, Two Defendant"
      );
    }
    await sectionsPage.caseNavigation.navigateTo("ROCA");
    await expect(rocaPage.restrictedTable).toBeVisible({ timeout: 30_000 });

    const expectedROCADefenceC = uploadedDocuments.filter(
      (document) =>
        document.defendants!.includes("One Defendant") ||
        document.defendants!.includes("Two Defendant") ||
        document.defendants!.includes("One Defendant, Two Defendant")
    );
    console.log("expected", expectedROCADefenceC);
    const issuesC = await rocaPage.validateROCAForUser(
      expectedROCADefenceC,
      rocaPage.restrictedTable
    );

    //Results summary
    const allIssues = [...issuesA, ...issuesB, ...issuesC];
    const { summaryLines, anyIssues } = assertNoIssues(
      [
        {
          label: "Restricted ROCA",
          issues: allIssues,
        },
      ],
      "Restricted ROCA Validation"
    );
    if (anyIssues) {
      const message = ["ROCA issues detected:", "", ...summaryLines].join("\n");
      expect(anyIssues, message).toBe(false);
    }
  });
});
