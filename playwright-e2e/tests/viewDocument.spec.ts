import { test, expect } from "../fixtures";
import {
  createNewCaseWithDefendantsAndUsers,
  createUniqueIdentifier,
} from "../helpers/createCase.helper";
import {
  runCleanupSafely,
  deleteCaseByName,
} from "../helpers/deleteCase.helper";
import { sections } from "../utils";
import { v4 as uuidv4 } from "uuid";
import { getRandomSectionKey } from "../utils";

/**
 * View Document
 * -----------------------------------------------------------------------
 *
 * This test suite validates the availability and rendering of Documents
 * on the View Document Page. It covers the following scenarios:
 *
 * 1) Placeholder file
 *    - Specific file types eg. .mp4, .mpeg or .wav are represented within the
 *      paginated bundle with a placeholder image
 */

test.describe("@nightly @regression Placeholder files", () => {
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
      const uniqueIdentifier = createUniqueIdentifier(uuidv4());
      const newCase = await createNewCaseWithDefendantsAndUsers(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        uniqueIdentifier,
        "Admin",
      );
      newCaseName = newCase.newCaseName;
    },
  );

  test(`Validate placeholder for file type .mp4`, async ({
    sectionsPage,
    sectionDocumentsPage,
    peoplePage,
    indexPage,
  }) => {
    await peoplePage.caseNavigation.navigateTo("Sections");
    const sampleEntry = await getRandomSectionKey(
      sectionsPage,
      sections.unrestricted,
    );
    for (const [, key] of sampleEntry) {
      await sectionsPage.uploadUnrestrictedSectionDocument(
        key,
        "placeholderTest.mp4",
      );
      await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    }
    await sectionDocumentsPage.caseNavigation.navigateTo("Index");
    await indexPage.documentLoad();
    const viewDocumentPage = await indexPage.goToViewDocument();
    const documentImage = viewDocumentPage.documentImage;
    await expect(documentImage).toBeVisible({ timeout: 60000 });
    await expect(documentImage).toHaveScreenshot("PlaceholderFile.png", {
      maxDiffPixelRatio: 0.01,
    });
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
