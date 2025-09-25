import { test, expect } from "../fixtures";
import { UserCredentials, config, invalidUsers } from "../utils";

test.describe("Create New Test Case in CCDCS", () => {
test.beforeEach(async ({ homePage, loginPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await loginPage.acceptCookies();
  });

test("Create New Case", async ({
    loginPage,
    createCasePage
}) => {
    await expect(loginPage.navigation.links["LogOff"]).toBeVisible();
    await expect(
    loginPage.navigation.links["ViewCaseListLink"]).toBeVisible();
    await createCasePage.createCaseLink.click();
    await createCasePage.createNewCase('TestCase','TestURN');
    await expect (createCasePage.caseTitle).toBeVisible();
  });
  
});
