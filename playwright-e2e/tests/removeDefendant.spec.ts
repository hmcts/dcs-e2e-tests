import { test, expect } from "../fixtures";
import { createNewCaseWithRestrictedDocument } from "../helpers/createCase.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";
import { openReviewPopupAwaitPagination } from "../helpers/reviewEvidencePagination.helper";
import ReviewEvidencePage from "../page-objects/pages/case/reviewEvidence/reviewEvidence.page";
import { loginAndOpenCase } from "../helpers/login.helper";
import { config } from "../utils";
import { v4 as uuidv4 } from "uuid";

/**
 * Remove Defendant Test
 * Purpose: When a defendant is removed from a case, any associated Defence representatives,
 * documents, hearings etc attached ONLY to that defendant should also be removed from
 * the case. If they are assigned to two defendants, then they should be reassigned to only
 * have the remaining defendant.
 */

test.describe("@regression @pagination Remove Defendant from Case", () => {
  let newCaseName: string;
  let sampleKey: [string, string][];

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
      const uniqueIdentifier = uuidv4();
      const newCase = await createNewCaseWithRestrictedDocument(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        sectionsPage,
        sectionDocumentsPage,
        rocaPage,
        uniqueIdentifier,
        "Defence",
      );
      sampleKey = newCase.sampleKey;
      newCaseName = newCase.newCaseName;
    },
  );

  test(`Defendant Removal: Verify removal of associated Defence users, documents, hearings and notes`, async ({
    homePage,
    loginPage,
    caseSearchPage,
    sectionsPage,
    caseDetailsPage,
    peoplePage,
    indexPage,
    rocaPage,
    editHearingDatePage,
    sectionDocumentsPage,
  }) => {
    // Add additional restricted document to the case assigned
    // to both Defendants
    const sectionKey = await sectionsPage.getSectionId(3);
    await sectionsPage.uploadRestrictedSectionDocument(
      sectionKey,
      "restrictedSectionUploadD1&D2",
      ["One, Defendant", "Two, Defendant"],
    );
    await sectionsPage.caseNavigation.navigateTo("CaseHome");

    // Add both Defendants to the Hearing
    await caseDetailsPage.navigateToEditHearingDate();
    await editHearingDatePage.addDefendantsToHearing();

    // Add a Widely shared note assigned to both Defendants as Defence Advocate C
    await sectionDocumentsPage.navigation.navigateTo("LogOff");
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateC,
      newCaseName,
    );
    const popup = await openReviewPopupAwaitPagination(caseDetailsPage);
    const reviewEvidencePage = new ReviewEvidencePage(popup);
    await reviewEvidencePage.sectionPanelLoad();
    const docId = await reviewEvidencePage.notes.selectSectionDocument("D1&D2");
    await reviewEvidencePage.notes.waitForHighResImageLoad(docId);
    await reviewEvidencePage.notes.openNotes();
    await reviewEvidencePage.notes.addnote(
      "Tightly Defence",
      config.users.defenceAdvocateC.group,
      config.users.defenceAdvocateC.username,
      200,
      180,
    );
    await popup.close();
    await caseDetailsPage.navigation.navigateTo("LogOff");

    // Login as HMCTS Admin and Remove Defendant One from the case
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.hmctsAdmin,
      newCaseName,
    );
    await caseDetailsPage.removeFirstDefendant();
    await caseDetailsPage.verifyDefendantRemoved(
      "Defendant One",
      "Defendant Two",
    );

    // Verify that the Hearing is only assigned to Defendant Two
    await caseDetailsPage.verifyHearingDefendants(
      "Defendant One",
      "Defendant Two",
    );

    // Verify Defence Advocate A has been removed from the case
    // Verify Defence Advocate C has only Defendant Two assigned
    await caseDetailsPage.caseNavigation.navigateTo("People");
    await peoplePage.confirmRetainedDefenceUserAccess(
      "Trainer23",
      "Defendant One",
      "Defendant Two",
    );
    await peoplePage.confirmRemovedUserAccess("Trainer21");

    // Verify that the document associated with Defendant One has
    // been removed
    await peoplePage.caseNavigation.navigateTo("Index");
    await indexPage.indexTableLoad();
    await indexPage.validateNoDocumentPresent(
      "restrictedSectionUploadDefendantOne",
    );

    // Verify that there is a Deletion record for this document in
    // the restricted ROCA table
    await indexPage.caseNavigation.navigateTo("ROCA");
    await rocaPage.waitForRocaTablesToLoad();
    await rocaPage.validateSingleRestrictedROCAEntry(
      "Delete",
      sampleKey[0][0],
      "restrictedSectionUploadDefendantOne",
      "Trainer01",
      "One Defendant",
    );
    await rocaPage.navigation.navigateTo("LogOff");

    // Verify that the note added by Defence Advocate C is now only
    // assigned to Defendant Two
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateC,
      newCaseName,
    );
    const popup2 = await openReviewPopupAwaitPagination(caseDetailsPage);
    const reviewEvidencePage2 = new ReviewEvidencePage(popup2);
    await reviewEvidencePage2.sectionPanelLoad();
    const docId2 =
      await reviewEvidencePage2.notes.selectSectionDocument("D1&D2");
    await reviewEvidencePage2.notes.waitForHighResImageLoad(docId2);
    const defendantsShared = await reviewEvidencePage2.notes.getNoteShare(0);
    expect(defendantsShared).toContain("Two, Defendant");
    expect(defendantsShared).not.toContain("One, Defendant");
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
