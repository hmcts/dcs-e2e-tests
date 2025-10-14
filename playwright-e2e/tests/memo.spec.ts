import { test, expect } from "../fixtures";

test.describe.serial("Memo Functionality", () => {

test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
});


test("Add, Change and Remove Memos", async ({
    createCasePage,
    caseDetailsPage,
    memoPage
    
}) => {
    await createCasePage.createCaseLink.click();
    const caseUrn = await createCasePage.createNewCase('TestCase','TestURN');
    await expect (caseDetailsPage.caseNameHeading).toBeVisible();
    await memoPage.addUpdateRemoveMemo();
    await expect(memoPage.memoHeading).toContainText('Memoranda');
    });
});
