import { test, expect } from "../fixtures";
import { config } from "../utils";

test.describe("Memo Functionality", () => {
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
      `${user.group} memo test textbox directly available`
    );
    await memoPage.addMemo(user.group);
    await expect(memoPage.memoTableRow2).toHaveText(
      `${user.group} memo test via Add a Memorandum button`
    );
    await memoPage.changeMemo();
    await expect(memoPage.memoTableRow1).toContainText("Change memo test");
    await memoPage.removeMemo();
    await expect(memoPage.memoTableRow1).toHaveText(
      `${user.group} memo test via Add a Memorandum button`,
      { timeout: 30000 }
    );
  });
});
