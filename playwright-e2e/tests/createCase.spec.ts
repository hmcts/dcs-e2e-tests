import { test, expect } from "../fixtures";
import { config } from "../utils";
import {
  runCleanupSafely,
  deleteCaseByName,
} from "../helpers/deleteCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";

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
 *    Note: Based on previous regression issues, a core change is to update
 *    the prosecution type and re-validate the URN field. Only when the prosecution
 *    type is 'CPS' should the URN field be enabled.
 *  - Assigning defence users with different defendant scopes, via both invite, and
 *    addition of a defence domain.
 */

test.describe("@regression @nightly Create & Update New Case", () => {
  let newCaseName: string;

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
  });

  test("Create New Case & Change Case Details", async ({
    homePage,
    loginPage,
    caseSearchPage,
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    changeCaseDetailsPage,
    peoplePage,
    accessPage,
    addEmailDomainPage,
  }) => {
    // Create a brand new case
    await caseSearchPage.goToCreateCase();
    const caseDetails = await createCasePage.createNewCase(
      "TestCase",
      "TestURN",
      "Probation",
    );
    newCaseName = caseDetails.newCaseName;
    await caseDetailsPage.validateCaseDetails(
      newCaseName,
      caseDetails.newCaseUrn,
      "Probation",
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
        caseDetails.newCaseUrn,
      );
    }
    await caseDetailsPage.validateDefendants([
      "Defendant One",
      "Defendant Two",
    ]);

    // Update case-level details
    await caseDetailsPage.goToChangeCaseDetails();
    await changeCaseDetailsPage.changeCaseDetails(caseDetails.newCaseUrn);
    await caseDetailsPage.validateCaseUpdate(caseDetails.newCaseUrn);

    // Invite defence users to access case with different defendant access
    await caseDetailsPage.caseNavigation.navigateTo("People");
    const defenceUserDetails = [
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

    // Confirm defence users have been granted the expected access by invite
    await peoplePage.validateUsers(defenceUserDetails);

    // Confirm Defence user access granted by the addition of a Domain email
    await peoplePage.caseNavigation.navigateTo("Access");
    await accessPage.navigateToAddDomain();
    await addEmailDomainPage.addEmailDomain("Defendant One", "pspb.cjsm.co.uk");
    await accessPage.verifyEmailDomain("pspb.cjsm.co.uk");
    await accessPage.navigation.navigateTo("LogOff");
    await loginAndOpenCase(
      homePage,
      loginPage,
      caseSearchPage,
      config.users.defenceAdvocateA,
      newCaseName,
    );
    await caseDetailsPage.caseNavigation.navigateTo("People");
    await peoplePage.validateUsers([
      {
        username: config.users.defenceAdvocateA.username,
        defendants: ["Defendant One"],
        role: "Defence",
      },
    ]);
  });

  //Cleanup: Remove dynamically created case
  test.afterEach(async () => {
    if (!newCaseName) return;

    await runCleanupSafely(async () => {
      console.log(`Attempting to delete test case: ${newCaseName}`);
      await deleteCaseByName(newCaseName, 180_000);
      console.log(`Cleanup completed for ${newCaseName}`);
    }, 180_000);
  });
});
