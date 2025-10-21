import { test, expect } from "../fixtures";

test.describe("Create & Update New Case in CCDCS", () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
  });

  test("Create New Case & Change Case Details", async ({
    caseSearchPage,
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    changeCaseDetailsPage,
  }) => {
    await caseSearchPage.goToCreateCase();
    const { newCaseName, newCaseUrn } = await createCasePage.createNewCase(
      "TestCase",
      "TestURN"
    );
    await expect(caseDetailsPage.caseNameHeading).toContainText(newCaseName);

    const defDetails = [
      { surName: "One", dobMonth: "January" },
      { surName: "Two", dobMonth: "February" },
    ];
    for (const defDetail of defDetails) {
      await caseDetailsPage.goToAddDefendant();
      await expect(addDefendantPage.addDefHeading).toHaveText("Add Defendant");
      await addDefendantPage.addDefendant(
        defDetail.surName,
        defDetail.dobMonth,
        newCaseUrn
      );
    }

    await expect(caseDetailsPage.nameDefOne).toBeVisible();
    await expect(caseDetailsPage.nameDefTwo).toBeVisible();
    await caseDetailsPage.goToChangeCaseDetails();
    await changeCaseDetailsPage.changeCaseDetails();
    await expect(caseDetailsPage.verifyAdditionalNotes).toBeVisible();
  });
});
