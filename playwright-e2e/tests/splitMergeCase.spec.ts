import { test, expect } from "../fixtures";
import { sections, config } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";
import { getRandomSectionKey } from "../utils";

/**
 * Split & Merge – End-to-End Case Integrity Validation
 * ---------------------------------------------------
 *
 * This suite validates the Split and Merge case functionality,
 * ensuring that data integrity, access control, and visibility
 * rules are preserved throughout both operations.
 *
 * Scope:
 *  - Defendant allocation across split cases
 *  - Role-based user propagation
 *  - Document copying with defence access restrictions
 *  - Memo visibility with user access restrictions
 *  - Index consistency
 *  - ROCA accuracy
 *
 * Key Rules Under Test:
 *  - Only HMCTS Admin users can Split or Merge cases
 *  - Defence users are copied only to cases containing their defendants
 *  - Restricted documents remain defendant-scoped after Split/Merge
 *  - Unrestricted documents propagate to all resulting cases
 *  - Merge de-duplicates documents and consolidates metadata
 *
 * Why this test is long:
 *  - Split & Merge is a high-risk, multi-actor workflow
 *  - Validation must be performed per role and per resulting case
 *  - Failures here can result in data leakage or loss
 */

test.describe("@regression Split & Merge Case Functionality", () => {
  let newCaseName: string;
  const hmctsAdminUser = config.users.hmctsAdmin;
  const defenceAdvocateAUser = config.users.defenceAdvocateA;

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

      // Seed case with defendants and users
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

  test(`Split & Merge Cases by HMCTS Admin`, async ({
    sectionsPage,
    createNewSectionPage,
    sectionDocumentsPage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    homePage,
    memoPage,
    indexPage,
    splitCasePage,
    rocaPage,
  }) => {
    test.setTimeout(720000);

    // --------------------------------------------------
    // Seed Data: Documents, Memos & Private Sections
    // --------------------------------------------------

    // Seed unrestricted content as HMCTS Admin
    // Only unrestricted documents should propagate to all split and merged cases
    await caseDetailsPage.caseNavigation.navigateTo("Memos");
    await memoPage.addMemo(hmctsAdminUser.group);
    await caseDetailsPage.caseNavigation.navigateTo("Sections");

    const sampleKey = await getRandomSectionKey(
      sectionsPage,
      sections.unrestricted,
    );
    for (const [section, sectionKey] of sampleKey) {
      await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
        sectionKey,
        "unrestrictedSectionUpload",
        section,
      );
      await sectionDocumentsPage.navigation.navigateTo("LogOff");

      // Seed defence-restricted content for Defendant One as Defence Advocate A
      // This content must only follow Defendant One through split
      await loginAndOpenCase(
        homePage,
        loginPage,
        caseSearchPage,
        defenceAdvocateAUser,
        newCaseName,
      );
      await caseDetailsPage.caseNavigation.navigateTo("Memos");
      await memoPage.addMemo(defenceAdvocateAUser.group);
      await caseDetailsPage.caseNavigation.navigateTo("Sections");
      await sectionsPage.gotoCreateNewSection();
      await createNewSectionPage.createPrivateSection("Defence A", "PD1");
      const sampleEntriesA = await getRandomSectionKey(
        sectionsPage,
        sections.restricted,
      );
      for (const [sectionA, sectionKeyA] of sampleEntriesA) {
        await sectionsPage.uploadRestrictedSectionDocument(
          sectionKeyA,
          "restrictedSectionUploadDefendantOne",
          "One, Defendant",
        );
        await sectionDocumentsPage.navigation.navigateTo("LogOff");

        // Seed defence-restricted content for Defendant Two as Defence Advocate B
        // This content must only follow Defendant Two through split/merge
        const defenceAdvocateBUser = config.users.defenceAdvocateB;
        await loginAndOpenCase(
          homePage,
          loginPage,
          caseSearchPage,
          defenceAdvocateBUser,
          newCaseName,
        );
        await caseDetailsPage.caseNavigation.navigateTo("Memos");
        await memoPage.addMemo(defenceAdvocateBUser.group);
        await caseDetailsPage.caseNavigation.navigateTo("Sections");
        await sectionsPage.gotoCreateNewSection();
        await createNewSectionPage.createPrivateSection("Defence B", "PD2");
        const sampleEntriesB = await getRandomSectionKey(
          sectionsPage,
          sections.restricted,
        );
        for (const [sectionB, sectionKeyB] of sampleEntriesB) {
          await sectionsPage.uploadRestrictedSectionDocument(
            sectionKeyB,
            "restrictedSectionUploadDefendantTwo",
            "Two, Defendant",
          );
          await sectionDocumentsPage.navigation.navigateTo("LogOff");

          // --------------------------------------------------
          // Action: Split Case by Defendant
          // --------------------------------------------------
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            hmctsAdminUser,
            newCaseName,
          );
          await sectionsPage.caseNavigation.navigateTo("Split");
          await splitCasePage.splitACase(newCaseName);
          await caseDetailsPage.confirmCaseSplit();
          // This creates one case per defendant and re-assigns access accordingly
          await splitCasePage.navigation.navigateTo("LogOff");

          // --------------------------------------------------
          // Validation: Post-Split Case Integrity
          // --------------------------------------------------

          // Validate Defence Advocate A split case:
          //  - Own memo is present
          //  - Other defence and admin memos are hidden
          //  - Restricted documents align with Defendant One
          //  - ROCA reflects correct document exposure
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateAUser,
            `${newCaseName}one`,
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTable).toContainText(
            "DefenceAdvocateA memo test textbox directly available",
          );
          await expect(memoPage.memoTable).not.toContainText(
            "HMCTSAdmin memo test textbox directly available",
          );
          await expect(memoPage.memoTable).not.toContainText(
            "DefenceAdvocateB memo test textbox directly available",
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentListA = await indexPage.getIndexDocuments();
          expect(documentListA.length).toBeGreaterThan(0);
          await indexPage.validateIndexDocument(
            "unrestrictedSectionUpload",
            section,
          );
          await indexPage.validateIndexDocument(
            "restrictedSectionUploadDefendantOne",
            sectionA,
          );
          await indexPage.validateNoAccessToRestrictedIndexDocument(
            "restrictedSectionUploadDefendantTwo",
          );
          await indexPage.validateSections(["PD1"]);
          await indexPage.validateSectionsMissing(["PD2"]);
          await indexPage.caseNavigation.navigateTo("ROCA");
          await rocaPage.waitForRocaTablesToLoad();
          await expect(rocaPage.splitAction).toBeVisible({ timeout: 30_000 });
          await expect(rocaPage.unrestrDocRoca).toBeVisible();
          await expect(rocaPage.defARestrDocRoca).toBeVisible();
          await expect(rocaPage.defBRestrDocRoca).toBeHidden();
          await rocaPage.navigation.logOff();

          // Validate Defence Advocate B split case:
          //  - Own memo is present
          //  - Other defence and admin memos are hidden
          //  - Restricted documents align with Defendant Two
          //  - ROCA reflects correct document exposure
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateBUser,
            `${newCaseName}two`,
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTable).toContainText(
            "DefenceAdvocateB memo test textbox directly available",
          );
          await expect(memoPage.memoTable).not.toContainText(
            "HMCTSAdmin memo test textbox directly available",
          );
          await expect(memoPage.memoTable).not.toContainText(
            "DefenceAdvocateA memo test textbox directly available",
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentListB = await indexPage.getIndexDocuments();
          expect(documentListB.length).toBeGreaterThan(0);
          await indexPage.validateIndexDocument(
            "unrestrictedSectionUpload",
            section,
          );
          await indexPage.validateIndexDocument(
            "restrictedSectionUploadDefendantTwo",
            sectionB,
          );
          await indexPage.validateNoAccessToRestrictedIndexDocument(
            "restrictedSectionUploadDefendantOne",
          );
          await indexPage.validateSections(["PD2"]);
          await indexPage.validateSectionsMissing(["PD1"]);
          await indexPage.caseNavigation.navigateTo("ROCA");
          await rocaPage.waitForRocaTablesToLoad();
          await expect(rocaPage.splitAction).toBeVisible({ timeout: 30_000 });
          await expect(rocaPage.unrestrDocRoca).toBeVisible();
          await expect(rocaPage.defBRestrDocRoca).toBeVisible();
          await expect(rocaPage.defARestrDocRoca).toBeHidden();
        }
      }
    }
  });

  test(`@merge Merge Cases as HMCTS Admin`, async ({
    sectionsPage,
    createNewSectionPage,
    sectionDocumentsPage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    homePage,
    memoPage,
    indexPage,
    splitCasePage,
    mergeCasePage,
    rocaPage,
  }) => {
    test.setTimeout(720000);

    // --------------------------------------------------
    // Seed Data: Documents, Memos & Private Sections
    // --------------------------------------------------

    // Seed unrestricted content as HMCTS Admin
    // Only unrestricted documents should propagate to all split and merged case
    await caseDetailsPage.caseNavigation.navigateTo("Memos");
    await memoPage.addMemo(hmctsAdminUser.group);
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    const sampleKey = await getRandomSectionKey(
      sectionsPage,
      sections.unrestricted,
    );
    for (const [section, sectionKey] of sampleKey) {
      await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
        sectionKey,
        "unrestrictedSectionUpload",
        section,
      );
      await sectionDocumentsPage.navigation.navigateTo("LogOff");

      // Seed defence-restricted content for Defendant One as Defence Advocate A
      // This content must only follow Defendant One through split
      await loginAndOpenCase(
        homePage,
        loginPage,
        caseSearchPage,
        defenceAdvocateAUser,
        newCaseName,
      );
      await caseDetailsPage.caseNavigation.navigateTo("Memos");
      await memoPage.addMemo(defenceAdvocateAUser.group);
      await caseDetailsPage.caseNavigation.navigateTo("Sections");
      await sectionsPage.gotoCreateNewSection();
      await createNewSectionPage.createPrivateSection("Defence A", "PD1");
      const sampleEntriesA = await getRandomSectionKey(
        sectionsPage,
        sections.restricted,
      );
      for (const [sectionA, sectionKeyA] of sampleEntriesA) {
        await sectionsPage.uploadRestrictedSectionDocument(
          sectionKeyA,
          "restrictedSectionUploadDefendantOne",
          "One, Defendant",
        );
        await sectionDocumentsPage.navigation.navigateTo("LogOff");

        // Seed defence-restricted content for Defendant Two as Defence Advocate B
        // This content must only follow Defendant Two through split/merge
        const defenceAdvocateBUser = config.users.defenceAdvocateB;
        await loginAndOpenCase(
          homePage,
          loginPage,
          caseSearchPage,
          defenceAdvocateBUser,
          newCaseName,
        );
        await caseDetailsPage.caseNavigation.navigateTo("Memos");
        await memoPage.addMemo(defenceAdvocateBUser.group);
        await caseDetailsPage.caseNavigation.navigateTo("Sections");
        await sectionsPage.gotoCreateNewSection();
        await createNewSectionPage.createPrivateSection("Defence B", "PD2");
        const sampleEntriesB = await getRandomSectionKey(
          sectionsPage,
          sections.restricted,
        );
        for (const [sectionB, sectionKeyB] of sampleEntriesB) {
          await sectionsPage.uploadRestrictedSectionDocument(
            sectionKeyB,
            "restrictedSectionUploadDefendantTwo",
            "Two, Defendant",
          );
          await sectionDocumentsPage.navigation.navigateTo("LogOff");

          // --------------------------------------------------
          // Action: Split Case by Defendant
          // --------------------------------------------------

          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            hmctsAdminUser,
            newCaseName,
          );
          await sectionsPage.caseNavigation.navigateTo("Split");
          await splitCasePage.splitACase(newCaseName);
          await caseDetailsPage.confirmCaseSplit();

          // --------------------------------------------------
          // Action: Merge Split Cases
          // --------------------------------------------------

          await caseDetailsPage.goToSplitCase(newCaseName);
          await caseDetailsPage.caseNavigation.navigateTo("Merge");
          await mergeCasePage.mergeCases(
            `${newCaseName}One`,
            `${newCaseName}Two`,
          );
          await caseDetailsPage.confirmCaseMerge();
          await mergeCasePage.navigation.navigateTo("LogOff");

          // --------------------------------------------------
          // Validation: Post-Merge Case Integrity
          // --------------------------------------------------

          // Validate Defence Advocate A merged case:
          //  - Own memo is present
          //  - Other defence and admin memos are hidden
          //  - Restricted documents align with Defendant One
          //  - ROCA reflects correct document exposure
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateAUser,
            `${newCaseName}One(M)`,
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTable).toContainText(
            "DefenceAdvocateA memo test textbox directly available",
          );
          await expect(memoPage.memoTable).not.toContainText(
            "HMCTSAdmin memo test textbox directly available",
          );
          await expect(memoPage.memoTable).not.toContainText(
            "DefenceAdvocateB memo test textbox directly available",
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentListA = await indexPage.getIndexDocuments();
          expect(documentListA.length).toBeGreaterThan(0);
          await indexPage.validateIndexDocument(
            "unrestrictedSectionUpload",
            section,
          );
          await indexPage.validateIndexDocument(
            "restrictedSectionUploadDefendantOne",
            sectionA,
          );
          await indexPage.validateNoAccessToRestrictedIndexDocument(
            "restrictedSectionUploadDefendantTwo",
          );
          await indexPage.validateSections(["PD1"]);
          await indexPage.validateSectionsMissing(["PD2"]);
          await indexPage.caseNavigation.navigateTo("ROCA");
          await rocaPage.waitForRocaTablesToLoad();
          await expect(rocaPage.splitAction).toBeVisible({ timeout: 30_000 });
          await expect(rocaPage.unrestrDocRoca).toBeVisible();
          await expect(rocaPage.defARestrDocRoca).toBeVisible();
          await expect(rocaPage.defBRestrDocRoca).toBeHidden();
          await rocaPage.navigation.navigateTo("LogOff");

          // Validate Defence Advocate B split case:
          //  - Own memo is present
          //  - Other defence and admin memos are hidden
          //  - Restricted documents align with Defendant Two
          //  - ROCA reflects correct document exposure
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateBUser,
            `${newCaseName}One(M)`,
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTable).toContainText(
            "DefenceAdvocateB memo test textbox directly available",
          );
          await expect(memoPage.memoTable).not.toContainText(
            "HMCTSAdmin memo test textbox directly available",
          );
          await expect(memoPage.memoTable).not.toContainText(
            "DefenceAdvocateA memo test textbox directly available",
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentListB = await indexPage.getIndexDocuments();
          expect(documentListB.length).toBeGreaterThan(0);
          await indexPage.validateIndexDocument(
            "unrestrictedSectionUpload",
            section,
          );
          await indexPage.validateIndexDocument(
            "restrictedSectionUploadDefendantTwo",
            sectionB,
          );
          await indexPage.validateNoAccessToRestrictedIndexDocument(
            "restrictedSectionUploadDefendantOne",
          );
          await indexPage.validateSections(["PD2"]);
          await indexPage.validateSectionsMissing(["PD1"]);
          await indexPage.caseNavigation.navigateTo("ROCA");
          await rocaPage.waitForRocaTablesToLoad();
          await expect(rocaPage.splitAction).toBeVisible({ timeout: 30_000 });
          await expect(rocaPage.unrestrDocRoca).toBeVisible();
          await expect(rocaPage.defBRestrDocRoca).toBeVisible();
          await expect(rocaPage.defARestrDocRoca).toBeHidden();
        }
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
