import { test, expect } from "../fixtures";
import CaseListPage from "../page-objects/pages/caseList.page";

test.describe("Create & Update New Case in CCDCS", () => {

test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await loginPage.acceptCookies();

  });

test("Create New Case & Change Case Details", async ({
    caseListPage,
    createCasePage,
    caseDetailsPage,
    addDefendantsPage
}) => {
    await caseListPage.goToCreateCase();
    const {caseUrn, caseName} = await createCasePage.createNewCase('TestCase','TestURN');
    await expect (caseDetailsPage.caseNameHeading).toContainText(caseName);
    
    const defDetails = [
    { surName: 'One', dobMonth: 'January' },
    { surName: 'Two', dobMonth: 'February' },
    ]
    for (const defDetail of defDetails) {
      await caseDetailsPage.goToAddDefendant();
      await expect (addDefendantsPage.addDefHeading).toHaveText('Add Defendant')
      await addDefendantsPage.addDefendants(defDetail.surName, defDetail.dobMonth,caseUrn);
      await expect (caseDetailsPage.caseNameHeading).toContainText(caseName);
    }
    await expect (caseDetailsPage.caseNameHeading).toContainText(caseName);
    await caseDetailsPage.changeCaseDetails();
    await expect (caseDetailsPage.caseNameHeading).toContainText(caseName)
  });

});
