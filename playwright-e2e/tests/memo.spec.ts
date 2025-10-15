import { test, expect } from "../fixtures";

test.describe.serial("Memo Functionality", () => {

test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
});


test("Add, Change and Remove Memos", async ({
    createCasePage,
    caseDetailsPage,
    caseListPage,
    memoPage
    
}) => {
    await caseListPage.goToCreateCase();
    await createCasePage.createNewCase('TestCase','TestURN');
    await expect (caseDetailsPage.caseNameHeading).toBeVisible();
    await memoPage.addUpdateRemoveMemo();
    await expect(memoPage.memoHeading).toContainText('Memoranda');
    });
});
