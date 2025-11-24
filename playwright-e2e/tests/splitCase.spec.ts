import { test, expect } from "../fixtures";
import { sections, config } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";

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

// Only users of role HMCTS Admin have access to the Split function. 

// On the Split Cases screen: 
// Step 1: 
// 1. Enter the number of cases you want to split this case into 
// 2. Click the Update button to confirm this number
//    The fields in Step 2 will now populate with the number of cases specified.
// Step 2: 
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

test.describe("Split & Merge Case Functionality", () => {
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

test(`Split & Merge Cases by HMCTS Admin`, async ({
    sectionsPage,
    createNewSectionPage,
    sectionDocumentsPage,
    loginPage,
    caseSearchPage,
    caseDetailsPage,
    homePage,
    memoPage,
    uploadDocumentPage,
    splitCasePage,
    mergeCasePage
  }) => {
 
// Add Memo, documents to unrestricted section as HMCTS Admin
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
      newCaseName
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
      newCaseName
    );
    await caseDetailsPage.caseNavigation.navigateTo('Memos')
    await memoPage.addDefBMemo();
    await caseDetailsPage.caseNavigation.navigateTo("Sections");
    await sectionsPage.gotoCreateNewSection();
    await createNewSectionPage.createPrivateSection("Defence B", 'PD2')
    for (const [_, sectionKey] of sampleEntries) {
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
      config.users.hmctsAdmin,
      newCaseName
    );
  await sectionsPage.caseNavigation.navigateTo("Split");
  await splitCasePage.splitACase(newCaseName)
  await expect(splitCasePage.progressBar).toContainText('50%',{timeout: 90_000 })
  await caseDetailsPage.navigation.navigateTo("LogOff"); 


  // Merge two cases by HMCTS Admin
  await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.hmctsAdmin,
      `${newCaseName}one`
    );
  await sectionsPage.caseNavigation.navigateTo("Merge");
  await mergeCasePage.mergeCases(`${newCaseName}one`,`${newCaseName}two`)
  await expect(mergeCasePage.progressBar).toContainText('50%',{timeout: 90_000 })
}}
});
});
