import { test, expect } from "../fixtures";
import { sections, config } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";
import { getRandomSectionKey } from "../utils";

// ============================================================
// Test 1: Split & Merge Case Functionality
// ============================================================

// The Split function allows a case with more than one defendant to be split into a number of cases as set by the user,
// and for the defendants to be allocated between those cases.
// When the case is split, all listed users will be copied across to the new cases,
// but defence users will only be copied to the cases containing defendants to which they are assigned.
// All documents, comments and memos will be copied across to the new cases,
// but documents in sections with defence access restrictions will only be copied to the cases
// containing defendants to which access has been granted.
// Only users of role HMCTS Admin have access to the Split & Merge function.

// The Merge function allows multiple cases to be combined into one DCS case.
// It can be used when a number of cases need to be consolidated, or when a defendant is sent to the Crown Court after his co-accused.
// When the cases are merged, all defendants and listed users will be copied across to the merged case.
// All documents, comments and memos will be copied across to the merged cases,
// but a de-duplication process will ensure that only one copy of each unique document will end up in the merged case.
// Where there are different comments on the same document in multiple cases,
// these will be consolidated as part of the de-duplication process.
// Any access permissions applied to documents in sections with defence access restrictions will remain in place on the new merged case.
// Only users of role HMCTS Admin have access to the Merge function.

test.describe("Split & Merge Case Functionality", () => {
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

      const newCase = await createNewCaseWithDefendantsAndUsers(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        "TestCase",
        "TestURN",
        "Defence"
      );
      newCaseName = newCase.newCaseName;
    }
  );

  test(`@split Split Case as HMCTS Admin`, async ({
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

    // Add a memo and unrestricted document as HMCTS Admin
    await caseDetailsPage.caseNavigation.navigateTo("Memos");
    await memoPage.addMemo(hmctsAdminUser.group);
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    const sampleKey = await getRandomSectionKey(
      sectionsPage,
      sections.unrestricted
    );
    for (const [section, sectionKey] of sampleKey) {
      await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
        sectionKey,
        "unrestrictedSectionUpload",
        section
      );
      await sectionDocumentsPage.navigation.navigateTo("LogOff");

      // Add a memo, new private section & restricted document as Defence Advocate A
      await loginAndOpenCase(
        homePage,
        loginPage,
        caseSearchPage,
        defenceAdvocateAUser,
        newCaseName
      );
      await caseDetailsPage.caseNavigation.navigateTo("Memos");
      await memoPage.addMemo(defenceAdvocateAUser.group);
      await caseDetailsPage.caseNavigation.navigateTo("Sections");
      await sectionsPage.gotoCreateNewSection();
      await createNewSectionPage.createPrivateSection("Defence A", "PD1");
      const sampleEntriesA = await getRandomSectionKey(
        sectionsPage,
        sections.restricted
      );
      for (const [sectionA, sectionKeyA] of sampleEntriesA) {
        await sectionsPage.uploadRestrictedSectionDocument(
          sectionKeyA,
          "restrictedSectionUploadDefendantOne",
          "One, Defendant"
        );
        await sectionDocumentsPage.navigation.navigateTo("LogOff");

        // Add a memo, new private section & restricted document as Defence Advocate B
        const defenceAdvocateBUser = config.users.defenceAdvocateB;
        await loginAndOpenCase(
          homePage,
          loginPage,
          caseSearchPage,
          defenceAdvocateBUser,
          newCaseName
        );
        await caseDetailsPage.caseNavigation.navigateTo("Memos");
        await memoPage.addMemo(defenceAdvocateBUser.group);
        await caseDetailsPage.caseNavigation.navigateTo("Sections");
        await sectionsPage.gotoCreateNewSection();
        await createNewSectionPage.createPrivateSection("Defence B", "PD2");
        const sampleEntriesB = await getRandomSectionKey(
          sectionsPage,
          sections.restricted
        );
        for (const [sectionB, sectionKeyB] of sampleEntriesB) {
          await sectionsPage.uploadRestrictedSectionDocument(
            sectionKeyB,
            "restrictedSectionUploadDefendantTwo",
            "Two, Defendant"
          );
          await sectionDocumentsPage.navigation.navigateTo("LogOff");

          // Split the case by Defendants as HMCTS Admin
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            hmctsAdminUser,
            newCaseName
          );
          await sectionsPage.caseNavigation.navigateTo("Split");
          await splitCasePage.splitCase(newCaseName);
          await caseDetailsPage.confirmCaseSplit();
          await splitCasePage.navigation.navigateTo("LogOff");

          // Split Case Validation - Memo, new Section, Index Documents & ROCA for Defence A
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateAUser,
            `${newCaseName}one`
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTable).toContainText(
            "DefenceAdvocateA memo test textbox directly available"
          );
          await expect(memoPage.memoTable).not.toContainText(
            "HMCTSAdmin memo test textbox directly available"
          );
          await expect(memoPage.memoTable).not.toContainText(
            "DefenceAdvocateB memo test textbox directly available"
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentListA = await indexPage.getIndexDocuments();
          expect(documentListA.length).toBeGreaterThan(0);
          await indexPage.validateIndexDocument(
            "unrestrictedSectionUpload",
            section
          );
          await indexPage.validateIndexDocument(
            "restrictedSectionUploadDefendantOne",
            sectionA
          );
          await indexPage.validateNoAccessToRestrictedIndexDocument(
            "restrictedSectionUploadDefendantTwo"
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

          // Split Case Validation - Memo, new Section, Index Documents & ROCA for Defence B
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateBUser,
            `${newCaseName}two`
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTable).toContainText(
            "DefenceAdvocateB memo test textbox directly available"
          );
          await expect(memoPage.memoTable).not.toContainText(
            "HMCTSAdmin memo test textbox directly available"
          );
          await expect(memoPage.memoTable).not.toContainText(
            "DefenceAdvocateA memo test textbox directly available"
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentListB = await indexPage.getIndexDocuments();
          expect(documentListB.length).toBeGreaterThan(0);
          await indexPage.validateIndexDocument(
            "unrestrictedSectionUpload",
            section
          );
          await indexPage.validateIndexDocument(
            "restrictedSectionUploadDefendantTwo",
            sectionB
          );
          await indexPage.validateNoAccessToRestrictedIndexDocument(
            "restrictedSectionUploadDefendantOne"
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

    // Add a memo and unrestricted document as HMCTS Admin
    await caseDetailsPage.caseNavigation.navigateTo("Memos");
    await memoPage.addMemo(hmctsAdminUser.group);
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    const sampleKey = await getRandomSectionKey(
      sectionsPage,
      sections.unrestricted
    );
    for (const [section, sectionKey] of sampleKey) {
      await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
        sectionKey,
        "unrestrictedSectionUpload",
        section
      );
      await sectionDocumentsPage.navigation.navigateTo("LogOff");

      // Add a memo, new private section & restricted document as Defence Advocate A
      await loginAndOpenCase(
        homePage,
        loginPage,
        caseSearchPage,
        defenceAdvocateAUser,
        newCaseName
      );
      await caseDetailsPage.caseNavigation.navigateTo("Memos");
      await memoPage.addMemo(defenceAdvocateAUser.group);
      await caseDetailsPage.caseNavigation.navigateTo("Sections");
      await sectionsPage.gotoCreateNewSection();
      await createNewSectionPage.createPrivateSection("Defence A", "PD1");
      const sampleEntriesA = await getRandomSectionKey(
        sectionsPage,
        sections.restricted
      );
      for (const [sectionA, sectionKeyA] of sampleEntriesA) {
        await sectionsPage.uploadRestrictedSectionDocument(
          sectionKeyA,
          "restrictedSectionUploadDefendantOne",
          "One, Defendant"
        );
        await sectionDocumentsPage.navigation.navigateTo("LogOff");

        // Add a memo, new private section & restricted document as Defence Advocate B
        const defenceAdvocateBUser = config.users.defenceAdvocateB;
        await loginAndOpenCase(
          homePage,
          loginPage,
          caseSearchPage,
          defenceAdvocateBUser,
          newCaseName
        );
        await caseDetailsPage.caseNavigation.navigateTo("Memos");
        await memoPage.addMemo(defenceAdvocateBUser.group);
        await caseDetailsPage.caseNavigation.navigateTo("Sections");
        await sectionsPage.gotoCreateNewSection();
        await createNewSectionPage.createPrivateSection("Defence B", "PD2");
        const sampleEntriesB = await getRandomSectionKey(
          sectionsPage,
          sections.restricted
        );
        for (const [sectionB, sectionKeyB] of sampleEntriesB) {
          await sectionsPage.uploadRestrictedSectionDocument(
            sectionKeyB,
            "restrictedSectionUploadDefendantTwo",
            "Two, Defendant"
          );
          await sectionDocumentsPage.navigation.navigateTo("LogOff");

          // Split the case by Defendants as HMCTS Admin
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            hmctsAdminUser,
            newCaseName
          );
          await sectionsPage.caseNavigation.navigateTo("Split");
          await splitCasePage.splitCase(newCaseName);
          await caseDetailsPage.confirmCaseSplit();

          // Merge two cases by HMCTS Admin

          await caseDetailsPage.goToSplitCase(newCaseName);
          await caseDetailsPage.caseNavigation.navigateTo("Merge");
          await mergeCasePage.mergeCases(
            `${newCaseName}One`,
            `${newCaseName}Two`
          );
          await caseDetailsPage.confirmCaseMerge();
          await mergeCasePage.navigation.navigateTo("LogOff");

          // Merged Case Validation - Memo, new Section, Index Documents & ROCA for Defence A
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateAUser,
            `${newCaseName}One(M)`
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTable).toContainText(
            "DefenceAdvocateA memo test textbox directly available"
          );
          await expect(memoPage.memoTable).not.toContainText(
            "HMCTSAdmin memo test textbox directly available"
          );
          await expect(memoPage.memoTable).not.toContainText(
            "DefenceAdvocateB memo test textbox directly available"
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentListA = await indexPage.getIndexDocuments();
          expect(documentListA.length).toBeGreaterThan(0);
          await indexPage.validateIndexDocument(
            "unrestrictedSectionUpload",
            section
          );
          await indexPage.validateIndexDocument(
            "restrictedSectionUploadDefendantOne",
            sectionA
          );
          await indexPage.validateNoAccessToRestrictedIndexDocument(
            "restrictedSectionUploadDefendantTwo"
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

          // Merged Case Validation - Memo, new Section, Index Documents & ROCA for Defence B
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateBUser,
            `${newCaseName}One(M)`
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTable).toContainText(
            "DefenceAdvocateB memo test textbox directly available"
          );
          await expect(memoPage.memoTable).not.toContainText(
            "HMCTSAdmin memo test textbox directly available"
          );
          await expect(memoPage.memoTable).not.toContainText(
            "DefenceAdvocateA memo test textbox directly available"
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentListB = await indexPage.getIndexDocuments();
          expect(documentListB.length).toBeGreaterThan(0);
          await indexPage.validateIndexDocument(
            "unrestrictedSectionUpload",
            section
          );
          await indexPage.validateIndexDocument(
            "restrictedSectionUploadDefendantTwo",
            sectionB
          );
          await indexPage.validateNoAccessToRestrictedIndexDocument(
            "restrictedSectionUploadDefendantOne"
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

  test.afterEach(async () => {
    if (!newCaseName) return;

    await runCleanupSafely(async () => {
      console.log(`Attempting to delete test case: ${newCaseName}`);
      await deleteCaseByName(newCaseName, 180_000);
      console.log(`Cleanup completed for ${newCaseName}`);
    }, 180_000);
  });
});
