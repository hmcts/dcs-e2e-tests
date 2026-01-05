import { test, expect } from "../fixtures";
import { sections, config } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";

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

// On the Split Cases screen:
// 1. Enter the number of cases you want to split this case into
// 2. Click the Update button to confirm this number
//    The fields in Step 2 will now populate with the number of cases specified.
// 3. The names of the new split cases will default to the same name as the source case.
//    Edit the new Case Names to those you wish to use.
// 4. The URNs of the new split cases will default to the same URN as the source case with the addition of /1, /2, etc. Amend as necessary.
// 5. Specify which defendant should go to which case by picking from the case drop down
// 6. Click on Split case to carry out the split
// A status bar will display detailing the progress of the splits and confirm when it has been completed.
// Search for your split cases to find them in your case list.

// The Merge function allows multiple cases to be combined into one DCS case.
// It can be used when a number of cases need to be consolidated, or when a defendant is sent to the Crown Court after his co-accused.
// When the cases are merged, all defendants and listed users will be copied across to the merged case.
// All documents, comments and memos will be copied across to the merged cases,
// but a de-duplication process will ensure that only one copy of each unique document will end up in the merged case.
// Where there are different comments on the same document in multiple cases,
// these will be consolidated as part of the de-duplication process.
// Any access permissions applied to documents in sections with defence access restrictions will remain in place on the new merged case.
// Only users of role HMCTS Admin have access to the Merge function.

// On the Merge Cases screen:
// The top left section of the screen will display details about the current case, namely the case name, URN and Crest case numbers.
// It will also list the defendants attached to this case.
// The top right section of the screen will display proposed details for the new merged case.
// 1. The New Case Name will default to the existing case name so will likely need to be amended to include the names of the additional defendants.
// 2. The New Case URN will default to the existing URN with (M) added on the end. Amend as necessary.
// 3. Search for the cases to be merged by typing in the Find cases to merge box.
//    You can search by Case Name, URN or Crest Case Number. Results will be filtered to cases at the same courthouse as the current case.
// 4. As you type a drop-down box will auto-populate with a list of matching cases.
//    Click on a case to add it to the list of cases to be merged.
// 5. If a case is added to the list in error, it can be removed with the Remove from Merge button.
// 6. When all the cases to be merged have been added to the list, confirm the New Case Name and New Case URN and then click on Merge cases button.
// A status bar will display detailing the progress of the merge. Once completed you will be taken to the new merged case.

test.describe("Split & Merge Case Functionality", () => {
  let newCaseName: string;
  const hmctsAdminUser = config.users.hmctsAdmin;

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
        "Defence"
      );
      newCaseName = newCase.newCaseName;
    }
  );

  test(`@split Split & Merge Cases by HMCTS Admin`, async ({
    sectionsPage,
    createNewSectionPage,
    sectionDocumentsPage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    homePage,
    memoPage,
    uploadDocumentPage,
    indexPage,
    splitCasePage,
    mergeCasePage,
    rocaPage,
  }) => {
    test.setTimeout(720000);
    // Add Memo, documents to unrestricted section as HMCTS Admin
    await caseDetailsPage.caseNavigation.navigateTo("Memos");
    await memoPage.addMemo(hmctsAdminUser.group);
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    const unrestrictedSections = sections.unrestricted;
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
      unrestrictedSections
    );
    const sampleEntries = Object.entries(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    for (const [section, key] of sampleEntries) {
      await sectionsPage.uploadUnrestrictedSectionDocument(
        key,
        "unrestrictedSectionUpload"
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
      await sectionsPage.navigation.navigateTo("LogOff");

      // Add memo, new section & documents to restricted section as Defence Advocate A
      const defenceAdvocateAUser = config.users.defenceAdvocateA;
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
      const restrictedSectionsA = sections.restricted;
      const restrictedSectionKeysA = await sectionsPage.getSectionKeys(
        restrictedSectionsA
      );
      const sampleEntriesA = Object.entries(restrictedSectionKeysA)
        .sort(() => Math.random() - 0.5)
        .slice(0, 1);

      for (const [sectionA, sectionKey] of sampleEntriesA) {
        await sectionsPage.goToUploadDocuments(sectionKey);
        await uploadDocumentPage.uploadRestrictedSectionDocument(
          "One, Defendant",
          "restrictedSectionUploadDefendantOne"
        );
        await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
        await sectionsPage.navigation.navigateTo("LogOff");

        // Add memo, new section & documents to restricted section as Defence Advocate B
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
        const restrictedSectionsB = sections.restricted;
        const restrictedSectionKeysB = await sectionsPage.getSectionKeys(
          restrictedSectionsB
        );
        const sampleEntriesB = Object.entries(restrictedSectionKeysB)
          .sort(() => Math.random() - 0.5)
          .slice(0, 1);
        for (const [sectionB, sectionKey] of sampleEntriesB) {
          await sectionsPage.goToUploadDocuments(sectionKey);
          await uploadDocumentPage.uploadRestrictedSectionDocument(
            "Two, Defendant",
            "restrictedSectionUploadDefendantTwo"
          );
          await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
          await sectionsPage.navigation.navigateTo("LogOff");

          // Split a case between two Defendants by HMCTS Admin
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            hmctsAdminUser,
            newCaseName
          );
          await sectionsPage.caseNavigation.navigateTo("Split");
          await splitCasePage.splitACase(newCaseName);
          await expect(splitCasePage.progressBar).toContainText("Preparing", {
            timeout: 20_000,
          });
          await splitCasePage.waitForSplitCaseCompletion();
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
          await expect(memoPage.memoTableRow1).toHaveText(
            "DefenceAdvocateA memo test textbox directly available"
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentList = await indexPage.getIndexDocuments();
          expect(documentList.length).toBeGreaterThan(0);
          await sectionDocumentsPage.validateUnrestrictedSectionDocument(
            "unrestrictedSectionUpload",
            section
          );
          await sectionDocumentsPage.validateSingleRestrictedSectionDocument(
            "restrictedSectionUploadDefendantOne",
            sectionA
          );
          const expectedSectionsA = ["PD1"];
          const foundSectionsA = await indexPage.validateSections(
            expectedSectionsA
          );
          expect(foundSectionsA).toEqual(expectedSectionsA);
          await expect(indexPage.pd2SectionLocator).not.toBeVisible({
            timeout: 10_000,
          });
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
          await expect(memoPage.memoTableRow1).toHaveText(
            "DefenceAdvocateB memo test textbox directly available"
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const documentList2 = await indexPage.getIndexDocuments();
          expect(documentList2.length).toBeGreaterThan(0);
          await sectionDocumentsPage.validateUnrestrictedSectionDocument(
            "unrestrictedSectionUpload",
            section
          );
          await sectionDocumentsPage.validateSingleRestrictedSectionDocument(
            "restrictedSectionUploadDefendantTwo",
            sectionB
          );
          const expectedSectionsB = ["PD2"];
          const foundSectionsB = await indexPage.validateSections(
            expectedSectionsB
          );
          expect(foundSectionsB).toEqual(expectedSectionsB);
          await expect(indexPage.pd1SectionLocator).not.toBeVisible({
            timeout: 10_000,
          });
          await indexPage.caseNavigation.navigateTo("ROCA");
          await rocaPage.waitForRocaTablesToLoad();
          await expect(rocaPage.splitAction).toBeVisible({ timeout: 30_000 });
          await expect(rocaPage.unrestrDocRoca).toBeVisible();
          await expect(rocaPage.defBRestrDocRoca).toBeVisible();
          await expect(rocaPage.defARestrDocRoca).toBeHidden();
          await rocaPage.navigation.navigateTo("LogOff");

          // Merge two cases by HMCTS Admin
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            hmctsAdminUser,
            `${newCaseName}one`
          );
          await sectionsPage.caseNavigation.navigateTo("Merge");
          await mergeCasePage.mergeCases(
            `${newCaseName}one`,
            `${newCaseName}two`
          );
          await expect(mergeCasePage.progressBar).toContainText("Preparing", {
            timeout: 20_000,
          });
          await mergeCasePage.waitForMergeCasesCompletion();
          await mergeCasePage.navigation.navigateTo("LogOff");

          // Merged Case Validation - Memo, new Section, Index Documents & ROCA for Defence A
          await loginAndOpenCase(
            homePage,
            loginPage,
            caseSearchPage,
            defenceAdvocateAUser,
            `${newCaseName}one(M)`
          );
          await caseDetailsPage.caseNavigation.navigateTo("Memos");
          await expect(memoPage.memoTableRow1).toHaveText(
            "DefenceAdvocateA memo test textbox directly available"
          );
          await caseDetailsPage.caseNavigation.navigateTo("Index");
          const mergedDocumentList1 = await indexPage.getIndexDocuments();
          expect(mergedDocumentList1.length).toBeGreaterThan(0);
          await sectionDocumentsPage.validateUnrestrictedSectionDocument(
            "unrestrictedSectionUpload",
            section
          );
          await sectionDocumentsPage.validateSingleRestrictedSectionDocument(
            "restrictedSectionUploadDefendantone",
            sectionA
          );
          const expectedSections = ["PD1"];
          const foundSections = await indexPage.validateSections(
            expectedSections
          );
          expect(foundSections).toEqual(expectedSections);
          await expect(indexPage.pd2SectionLocator).not.toBeVisible({
            timeout: 10_000,
          });
          await indexPage.caseNavigation.navigateTo("ROCA");
          await rocaPage.waitForRocaTablesToLoad();
          await expect(rocaPage.mergeAction).toBeVisible({ timeout: 30_000 });
          await expect(rocaPage.unrestrDocRoca).toBeVisible();
          await expect(rocaPage.defARestrDocRoca).toBeVisible();
          await expect(rocaPage.defBRestrDocRoca).toBeHidden();
          await rocaPage.navigation.navigateTo("LogOff");
        }
      }
    }
    test.afterEach(async () => {
      if (!newCaseName) return;

      await runCleanupSafely(async () => {
        console.log(`Attempting to delete test case: ${newCaseName}`);
        await deleteCaseByName(newCaseName, 180_000);
        console.log(`Cleanup completed for ${newCaseName}`);
      }, 180_000);
    });
  });
});
