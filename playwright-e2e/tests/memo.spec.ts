import { test, expect } from "../fixtures";
import { config } from "../utils";
import {
  runCleanupSafely,
  deleteCaseByName,
} from "../helpers/deleteCase.helper";

/**
 * Memo Validation
 * ----------------------------
 *
 * This test validates the full lifecycle of case memos:
 *  - Creating memos via multiple UI entry points
 *  - Editing an existing memo
 *  - Removing a memo and validating remaining state
 *
 * The test uses a newly created case to ensure isolation and
 * avoids reliance on pre-seeded data.
 */

test.describe("@nightly @regression Memo Functionality", () => {
  let newCaseName: string;

  test.beforeEach(
    async ({ homePage, caseSearchPage, createCasePage, caseDetailsPage }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();
      const caseDetails = await createCasePage.createNewCase(
        "TestCase",
        "TestURN",
      );
      newCaseName = caseDetails.newCaseName;
      await expect(caseDetailsPage.caseNameHeading).toBeVisible();
    },
  );

  test("Add, Change and Remove Memos", async ({
    caseDetailsPage,
    memoPage,
  }) => {
    await caseDetailsPage.caseNavigation.navigateTo("Memos");
    await expect(memoPage.memoHeading).toContainText("Add a Memorandum");
    const user = config.users.hmctsAdmin;
    const memos = [
      `${user.group} memo test textbox directly available`,
      `${user.group} memo test via Add a Memorandum button`,
    ];
    for (const memo of memos) {
      await memoPage.addMemo(user.group);
      await expect(memoPage.getMemoRowByText(memo)).toBeVisible({
        timeout: 30000,
      });
    }
    await memoPage.changeMemo();
    await expect(memoPage.getMemoRowByText(`Change memo test`)).toBeVisible({
      timeout: 30000,
    });
    await memoPage.removeMemo();
    await memoPage.expectMemoCount(1);
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
