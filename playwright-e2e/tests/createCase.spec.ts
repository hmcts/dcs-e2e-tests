import { test, expect } from "../fixtures";

test.describe.serial("Create & Update New Case in CCDCS", () => {

test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await loginPage.acceptCookies();
  });

test("Create New Case & Change Case Details", async ({
    createCasePage,
    caseDetailsPage,
}) => {
    await createCasePage.createCaseLink.click();
    const caseUrn = await createCasePage.createNewCase('TestCase','TestURN');
    await expect (caseDetailsPage.caseNameHeading).toBeVisible();
    
    const defDetails = [
    { surName: 'One', dobMonth: 'January' },
    { surName: 'Two', dobMonth: 'February' },
    ]
    for (const defDetail of defDetails) {
      await createCasePage.addDefendants(defDetail.surName, defDetail.dobMonth,caseUrn);
      await expect (caseDetailsPage.caseNameHeading).toBeVisible();
    }
    await expect (caseDetailsPage.caseNameHeading).toBeVisible();
    await createCasePage.changeCaseDetails();
  });
});
