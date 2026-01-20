import { test, expect } from "../fixtures";
import { config } from "../utils";

test.describe("@regression @nightly Create & Update New Case in CCDCS", () => {
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
    peoplePage,
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

    // Add Defence Lawyers
    await caseDetailsPage.caseNavigation.navigateTo("People");
    const defenceUserDetails = [
      {
        username: config.users.defenceAdvocateA.username,
        defendants: ["Defendant One"],
      },
      {
        username: config.users.defenceAdvocateB.username,
        defendants: ["Defendant Two"],
      },
      {
        username: config.users.defenceAdvocateC.username,
        defendants: ["Defendant One", "Defendant Two"],
      },
      { username: config.users.admin.username },
    ];
    for (const defenceDetail of defenceUserDetails) {
      await peoplePage.addUser(
        defenceDetail.username,
        defenceDetail?.defendants
      );
    }
    await expect(peoplePage.pageTitle).toBeVisible({ timeout: 40_000 });
    await peoplePage.confirmUserAccess(
      config.users.defenceAdvocateA.username,
      "Defence"
    );
    await peoplePage.confirmUserAccess(
      config.users.defenceAdvocateB.username,
      "Defence"
    );
    await peoplePage.confirmUserAccess(
      config.users.defenceAdvocateC.username,
      "Defence"
    );
  });
});
