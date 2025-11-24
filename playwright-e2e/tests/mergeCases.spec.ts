import { test, expect } from "../fixtures";
import { sections, config } from "../utils";
import { createNewCaseWithDefendantsAndUsersForMerge1, createNewCaseWithDefendantsAndUsersForMerge2 } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import { uploadAndValidateRestrictedDocumentUpload } from "../helpers/sectionDocuments.helper";
import { deleteCaseByName } from "../helpers/deleteCase.helper";


// ============================================================
// Test 1: Merge Cases Functionality 
// ============================================================

// The Merge function allows multiple cases to be combined into one DCS case. 
// It can be used when a number of cases need to be consolidated, or when a defendant is sent to the Crown Court after his co-accused. 
// When the cases are merged, all defendants and listed users will be copied across to the merged case. 
// All documents, comments and memos will be copied across to the merged cases, 
// but a de-duplication process will ensure that only one copy of each unique document will end up in the merged case. 
// Where there are different comments on the same document in multiple cases, 
// these will be consolidated as part of the de-duplication process. 
// Any access permissions applied to documents in sections with defence access restrictions will remain in place on the new merged case. 
// Only users of role HMCTS Admin have access to the Merge function. 


test.describe("Merge Case Functionality", () => {
    let newCaseName1: string;
    let newCaseName2: string;

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
      const newCase1 = await createNewCaseWithDefendantsAndUsersForMerge1(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        "TestCase",
        "TestURN"
      );
      newCaseName1 = newCase1.newCaseName;
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();
      const newCase2 = await createNewCaseWithDefendantsAndUsersForMerge2(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        "TestCase",
        "TestURN"
      );
      newCaseName2 = newCase2.newCaseName;
      await peoplePage.navigation.navigateTo("LogOff");
    }
  );


test(`Merging two Cases by HMCTS Admin`, async ({
    sectionsPage,
    createNewSectionPage,
    sectionDocumentsPage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    homePage,
    memoPage,
    uploadDocumentPage,
    mergeCasePage
  }) => {

// Add Memo, documents to unrestricted section for MergeCase1 as HMCTS Admin
await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.hmctsAdmin,
      newCaseName1
    );

    await caseDetailsPage.caseNavigation.navigateTo('Memos')
    await memoPage.addMemo();
    await caseDetailsPage.caseNavigation.navigateTo("Sections"); 
    const unrestrictedSections = sections.unrestricted;
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
      unrestrictedSections
    );
    const sampleEntries = Object.entries(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    for (const [section, key] of sampleEntries) {
        await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
          key,
          "unrestrictedSectionUpload",
          'A'
        );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    await sectionsPage.navigation.navigateTo("LogOff");

// Add Memo, documents to unrestricted section for MergeCase2 as HMCTS Admin
await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.hmctsAdmin,
      newCaseName2
    );

    await caseDetailsPage.caseNavigation.navigateTo('Memos')
    await memoPage.addMemo();
    await caseDetailsPage.caseNavigation.navigateTo("Sections"); 
    const unrestrictedSections = sections.unrestricted;
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
      unrestrictedSections
    );
    const sampleEntries = Object.entries(unrestrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    for (const [section, key] of sampleEntries) {
        await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
          key,
          "unrestrictedSectionUpload",
          'J'
        );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    await sectionsPage.navigation.navigateTo("LogOff");

  // Add memo, new Private section & documents to restricted section as Defence Advocate A
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName1
    );
    await caseDetailsPage.caseNavigation.navigateTo('Memos')
    await memoPage.addDefAMemo();
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    await sectionsPage.gotoCreateNewSection();
    await createNewSectionPage.createPrivateSection("Defence A", 'PD1')
    const restrictedSections = sections.restricted;
    const restrictedSectionKeys = await sectionsPage.getSectionKeys(
      restrictedSections
    );
    const sampleEntries = Object.entries(restrictedSectionKeys)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    for (const [_, sectionKey] of sampleEntries) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadRestrictedSectionDocument(
        "One, Defendant",
        "restrictedSectionUploadDefendantOne"
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
  await sectionsPage.navigation.navigateTo("LogOff");

// Add memo, new Private section & documents to restricted section as Defence Advocate B
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateB,
      newCaseName2
    );
    await caseDetailsPage.caseNavigation.navigateTo('Memos')
    await memoPage.addDefBMemo();
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    await sectionsPage.gotoCreateNewSection();
    await createNewSectionPage.createPrivateSection("Defence B", 'PD2')
    const restrictedSections2 = sections.restricted;
    const restrictedSectionKeys2 = await sectionsPage.getSectionKeys(
      restrictedSections2
    );
    const sampleEntries2 = Object.entries(restrictedSectionKeys2)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);
    
    for (const [_, sectionKey] of sampleEntries2) {
      await sectionsPage.goToUploadDocuments(sectionKey);
      await uploadDocumentPage.uploadRestrictedSectionDocument(
        "Two, Defendant",
        "restrictedSectionUploadDefendantTwo"
      );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
  await sectionsPage.navigation.navigateTo("LogOff"); 


// Merge two cases by HMCTS Admin
  await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.hmctsAdmin,
      newCaseName1
    );
  await sectionsPage.caseNavigation.navigateTo("Merge");
  await mergeCasePage.mergeCases(newCaseName1, newCaseName2)
  await expect(mergeCasePage.progressBar).toContainText('50%',{timeout: 90_000 })
}}
})
})