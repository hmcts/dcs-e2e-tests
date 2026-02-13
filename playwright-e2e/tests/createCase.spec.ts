import { test, expect } from "../fixtures";
import { config } from "../utils";

/**
 * Case Creation & End-to-End Setup Test
 * ------------------------------------
 *
 * This test validates the full lifecycle of creating a new case in CCDCS,
 * followed by core configuration actions required for most downstream tests.
 *
 * The flow covered includes:
 *  - Creating a brand new case
 *  - Adding multiple defendants
 *  - Updating case details
 *  - Assigning defence users with different defendant scopes
 *
 * Purpose:
 * - Acts as an end-to-end regression test for core case setup
 * - Serves as a reference implementation for how a "fully configured" case
 *   should be created via the UI
 */

test.describe("@regression @nightly Create & Update New Case", () => {
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
    // Create a brand new case
    await caseSearchPage.goToCreateCase();
    const { newCaseName, newCaseUrn, prosecutedByLabel } =
      await createCasePage.createNewCase("TestCase", "TestURN");
    await caseDetailsPage.validateCaseDetails(
      newCaseName,
      newCaseUrn,
      prosecutedByLabel,
    );

    // Add multiple defendants to the case
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
        newCaseUrn,
      );
    }
    await caseDetailsPage.validateDefendants();

    // Update case-level details
    await caseDetailsPage.goToChangeCaseDetails();
    await changeCaseDetailsPage.changeCaseDetails();
    await caseDetailsPage.validateCaseUpdate();

    // Assign defence users with different levels of defendant access
    await caseDetailsPage.caseNavigation.navigateTo("People");
    const defenceUserDetails = [
      {
        username: config.users.defenceAdvocateA.username,
        defendants: ["Defendant One"],
        role: "Defence",
      },
      {
        username: config.users.defenceAdvocateB.username,
        defendants: ["Defendant Two"],
        role: "Defence",
      },
      {
        username: config.users.defenceAdvocateC.username,
        defendants: ["Defendant One", "Defendant Two"],
        role: "Defence",
      },
    ];
    for (const defenceDetail of defenceUserDetails) {
      await peoplePage.addUser(
        defenceDetail.username,
        defenceDetail?.defendants,
      );
    }
    await expect(peoplePage.pageTitle).toBeVisible({ timeout: 40_000 });

    // Confirm defence users have been granted the expected access
    await peoplePage.validateUsers(defenceUserDetails);
  });
});
