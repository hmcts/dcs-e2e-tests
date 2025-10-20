import { test, expect } from "../fixtures";

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
    await createCasePage.createNewCase('TestCase','TestURN');
    await expect (caseDetailsPage.caseNameHeading).toBeVisible();   
    await caseDetailsPage.caseNavigation.navigateTo('Memos')
    await expect (memoPage.memoHeading).toContainText('Add a Memorandum');
    await memoPage.addMemo();
    await expect (memoPage.memoTableRow1).toHaveText("Add memo test textbox directly available")
    await memoPage.addMemo();
    await expect (memoPage.memoTableRow2).toHaveText("Add memo test via Add A Memorandum button")
    await memoPage.changeMemo();
    await expect (memoPage.memoTableRow1).toContainText('Change memo test');
    await memoPage.removeMemo();
    await expect (memoPage.memoTableRow1).toHaveText("Add memo test via Add A Memorandum button")

    });
});
