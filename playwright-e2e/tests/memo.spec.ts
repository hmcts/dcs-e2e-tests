import { test, expect } from "../fixtures";
import { config } from "../utils";

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
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
  });

  test("Add, Change and Remove Memos", async ({
    createCasePage,
    caseDetailsPage,
    caseSearchPage,
    memoPage,
  }) => {
    await caseSearchPage.goToCreateCase();
    await createCasePage.createNewCase("TestCase", "TestURN");
    await expect(caseDetailsPage.caseNameHeading).toBeVisible();
    await caseDetailsPage.caseNavigation.navigateTo("Memos");
    await expect(memoPage.memoHeading).toContainText("Add a Memorandum");
    const user = config.users.hmctsAdmin;
    await memoPage.addMemo(user.group);
    await expect(memoPage.memoTableRow1).toHaveText(
      `${user.group} memo test textbox directly available`,
      { timeout: 30000 },
    );
    await memoPage.addMemo(user.group);
    await expect(memoPage.memoTableRow2).toHaveText(
      `${user.group} memo test via Add a Memorandum button`,
      { timeout: 30000 },
    );
    await memoPage.changeMemo();
    await expect(memoPage.memoTableRow1).toContainText("Change memo test");
    await memoPage.removeMemo();
    const remainingMemo = memoPage.page.locator(
      `xpath=//table[@class='formTable-zebra']//td[contains(text(), '${user.group} memo test via Add a Memorandum button')]`,
    );
    await expect(remainingMemo).toBeVisible({ timeout: 30000 });
  });
});
