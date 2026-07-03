import { expect, test } from "../fixtures.ts";
import { config } from "../utils/index.ts";
import {
  createNewCaseWithDefendantsAndUsers,
  createUniqueIdentifier,
} from "../helpers/createCase.helper.ts";
import { loginAndOpenCase } from "../helpers/login.helper.ts";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper.ts";
import { uploadRestrictedDocument } from "../helpers/sectionDocuments.helper.ts";
import { v4 as uuidv4 } from "uuid";
import ReviewEvidencePage from "../page-objects/pages/case/reviewEvidence/reviewEvidence.page.ts";
import { openReviewPopupAwaitPagination } from "../helpers/reviewEvidencePagination.helper.ts";

// Constants for test data
const nameDefendantOne = "One, Defendant";
const nameDefendantTwo = "Two, Defendant";
const docDefendantOne = "restrictedSectionUploadDefendantOne";
const docDefendantTwo = "restrictedSectionUploadDefendantTwo";
const userGroup_Defence = "Defence";

/**
 * Authorised Document Access Validation via Pages Panel on Review Evidence Page
 * -----------------------------
 *
 * Purpose:
 * Validate role access when navigating to restricted documents,
 * utilising the Pages functionality within the Review Evidence page.
 */

test.describe("@regression Document Access Validation via Pages", () => {
  let newCaseName: string;
  let caseKey: string | null;
  let documentKeyDefenceA: string;
  let documentKeyDefenceB: string;
  let sectionDefenceA: string;

  test.beforeEach(
    async ({
      homePage,
      caseSearchPage,
      caseDetailsPage,
      createCasePage,
      addDefendantPage,
      peoplePage,
      loginPage,
      sectionDocumentsPage,
      sectionsPage,
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();

      // Create Case with Defendants and Defence Users
      // Defence Advocate A represents Defendant One
      // Defence Advocate B represents Defendant Two
      // Defence Advocate C represents Defendant One and Two
      const uniqueIdentifier = createUniqueIdentifier(uuidv4());
      const newCase = await createNewCaseWithDefendantsAndUsers(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        uniqueIdentifier,
        userGroup_Defence,
      );
      newCaseName = newCase.newCaseName;
      await peoplePage.navigation.logOff();

      // Upload document to restricted section as Defence Advocate A
      // Access to this document is restricted to Defence Advocates for Defendant One (A, C)
      const { sectionName: sectionDefenceA_name, documentKey: docKeyDefA } =
        await uploadRestrictedDocument(
          homePage,
          loginPage,
          caseSearchPage,
          caseDetailsPage,
          sectionsPage,
          sectionDocumentsPage,
          config.users.defenceAdvocateA,
          newCaseName,
          docDefendantOne,
          [nameDefendantOne],
        );
      sectionDefenceA = sectionDefenceA_name;
      documentKeyDefenceA = docKeyDefA;
      caseKey = await sectionDocumentsPage.getCaseKey();
      await sectionDocumentsPage.navigation.navigateTo("LogOff");

      // Upload document to restricted section as Defence Advocate B
      // a) To enable the Review Evidence Page to open (otherwise Defence Advocate B will have no accesible documents to review)
      // b) To enable distinction between accessible and inaccessible documents
      // Access to this document is restricted to Defence Advocates for Defendant Two (B, C)
      const { documentKey: docKeyDefB } = await uploadRestrictedDocument(
        homePage,
        loginPage,
        caseSearchPage,
        caseDetailsPage,
        sectionsPage,
        sectionDocumentsPage,
        config.users.defenceAdvocateB,
        newCaseName,
        docDefendantTwo,
        [nameDefendantTwo],
      );
      documentKeyDefenceB = docKeyDefB;
    },
  );

  // ============================================================
  // Scenario 1
  // ============================================================

  // When Defence Advocate A uploads a restricted document
  // If Defence Advocate A shares a link to the document with Defenca Advocate B - Then Defence Advocate B should not be able to access the document via the link.
  // If Defence Advocate A shares a link to the document with Defenca Advocate C - Then Defence Advocate C should be able to access the document via the link.

  test("Document Access Validation via the Pages 'Copy Link' Functionality", async ({
    loginPage,
    homePage,
    caseDetailsPage,
    caseSearchPage,
    sectionDocumentsPage,
  }) => {
    // Open the Review Evidence page as Defence Advocate B

    const popup = await openReviewPopupAwaitPagination(sectionDocumentsPage);
    const reviewEvidencePage = new ReviewEvidencePage(popup);

    await reviewEvidencePage.sectionPanelLoad();
    await reviewEvidencePage.waitForHighResImageLoadByDocument(
      documentKeyDefenceB,
      docDefendantTwo,
    );
    // Attempt to navigate to Defence Advocate A's restricted document via the Copied Link as Defence Advocate B
    // The url has been formatted to match the Copy Link shared link

    await reviewEvidencePage.page.goto(
      `${config.urls.base}/Case/Review3/${caseKey}?d=${documentKeyDefenceA}&p=1`,
    );

    await reviewEvidencePage.sectionPanelLoad();
    await reviewEvidencePage.waitForHighResImageLoadByDocument(
      documentKeyDefenceB,
      docDefendantTwo,
    );

    expect(await reviewEvidencePage.getCurrentDocumentKey()).toBe(
      documentKeyDefenceB,
    );

    await popup.close();
    await sectionDocumentsPage.navigation.navigateTo("LogOff");

    // Validate Defence Advocate C can access Defence Advocate A's restricted document via the Copy Link functionality
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateC,
      newCaseName,
    );

    // Open the Review Page
    const popupDefenceC = await openReviewPopupAwaitPagination(caseDetailsPage);
    const reviewEvidencePageDefenceC = new ReviewEvidencePage(popupDefenceC);

    await reviewEvidencePageDefenceC.sectionPanelLoad();

    // Ensure we start from Defence Advocate B's document before attempting to access A's restricted document
    await reviewEvidencePageDefenceC.ensureDocumentIsOpen(
      documentKeyDefenceB,
      docDefendantTwo,
    );

    // Attempt to navigate to Defence Advocate A's restricted document via the Copied Link
    // The url has been formatted to match the Copy Link functionality share link
    await reviewEvidencePageDefenceC.page.goto(
      `${config.urls.base}/Case/Review3/${caseKey}?d=${documentKeyDefenceA}&p=1`,
    );

    await reviewEvidencePageDefenceC.waitForHighResImageLoadByDocument(
      documentKeyDefenceA,
      docDefendantOne,
    );

    expect(await reviewEvidencePageDefenceC.getCurrentDocumentKey()).toBe(
      documentKeyDefenceA,
    );
  });

  // ============================================================
  // Scenario 2
  // ============================================================

  // When Defence Advocate A uploads a restricted document
  // If Defence Advocate B attempts to input a known restricted page into the Go To Page functionality - Then Defence Advocate B should not be able to access this document page.
  // If Defence Advocate C inputs the same restricted page into the Go To Page functionality - Then Defence Advocate C should be able to access the document page.

  test("Document Access Validation via the Pages 'Go To Page' Functionality", async ({
    loginPage,
    homePage,
    caseDetailsPage,
    caseSearchPage,
    sectionDocumentsPage,
  }) => {
    // Open the Review Evidence page as Defence Advocate B

    const popup = await openReviewPopupAwaitPagination(sectionDocumentsPage);
    const reviewEvidencePage = new ReviewEvidencePage(popup);

    await reviewEvidencePage.sectionPanelLoad();
    await reviewEvidencePage.waitForHighResImageLoadByDocument(
      documentKeyDefenceB,
      docDefendantTwo,
    );

    // Attempt to navigate to an unathorised document page as Defence Advocate B

    await reviewEvidencePage.pages.goToPage(sectionDefenceA + "1");

    // No reload occurs - page should remain constant on Defence Advocate B's document
    await reviewEvidencePage.confirmDocumentPage(documentKeyDefenceB);
    await popup.close();
    await sectionDocumentsPage.navigation.navigateTo("LogOff");

    // Validate Defence Advocate C can access Defence Advocate A's document via Go To Page
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateC,
      newCaseName,
    );

    // Open the Review page
    const popupDefenceC = await openReviewPopupAwaitPagination(caseDetailsPage);
    const reviewEvidencePageDefenceC = new ReviewEvidencePage(popupDefenceC);

    await reviewEvidencePageDefenceC.sectionPanelLoad();

    // Ensure we start from Defence Advocate B's document before attempting to access A's restricted document
    await reviewEvidencePageDefenceC.ensureDocumentIsOpen(
      documentKeyDefenceB,
      docDefendantTwo,
    );

    // Use the Go To Page input to navigate to Defence Advocate A's document
    await reviewEvidencePageDefenceC.pages.goToPage(sectionDefenceA + "1");

    await reviewEvidencePageDefenceC.waitForHighResImageLoadByDocument(
      documentKeyDefenceA,
      docDefendantOne,
    );

    expect(await reviewEvidencePageDefenceC.getCurrentDocumentKey()).toBe(
      documentKeyDefenceA,
    );
  });

  test.afterEach(async () => {
    if (!newCaseName) return;

    await runCleanupSafely(async () => {
      console.log(
        `Attempting to delete test case: ${newCaseName} for Test: Section Uploads`,
      );
      await deleteCaseByName(newCaseName, 180_000);
    }, 180_000);
  });
});
