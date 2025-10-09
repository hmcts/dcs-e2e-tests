import { test, expect } from "../fixtures";

test.describe("Ingest Files in a Case in CCDCS", () => {

test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await loginPage.acceptCookies();

  });

test("Ingest file to a new case", async ({
    caseListPage,
    createCasePage,
    caseDetailsPage,
    addDefendantsPage,
    ingestFilePage
    
}) => {
    await caseListPage.goToCreateCase();
    const {newCaseName, newCaseUrn} = await createCasePage.createNewCase('TestCase','TestURN');
    await expect (caseDetailsPage.caseNameHeading).toContainText(newCaseName);
    const defDetails = [
    { surName: 'One', dobMonth: 'January' },
    { surName: 'Two', dobMonth: 'February' },
    ]
    for (const defDetail of defDetails) {
      await caseDetailsPage.goToAddDefendant();
      await expect (addDefendantsPage.addDefHeading).toHaveText('Add Defendant')
      await addDefendantsPage.addDefendants(defDetail.surName, defDetail.dobMonth,newCaseUrn);
      await expect (caseDetailsPage.caseNameHeading).toContainText(newCaseName);
    }
    await expect (caseDetailsPage.caseNameHeading).toContainText(newCaseName);
    await ingestFilePage.ingestLink.click();
    await expect (ingestFilePage.ingestHeading).toHaveText('Ingest Composite File')

  });

});
