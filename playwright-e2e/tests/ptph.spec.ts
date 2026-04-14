import { test, expect } from "../fixtures";
import { pushTestResult } from "../utils";
import {
  createNewCaseWithDefendantsAndUsers,
  createUniqueIdentifier,
} from "../helpers/createCase.helper";
import { uploadPTPHForm } from "../helpers/ptph.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";
import { v4 as uuidv4 } from "uuid";

/**
 * PTPH Form Rendering Tests
 * -------------------------
 *
 * This test suite validates the accurate rendering of PTPH (Pre-Trial Plea Hearing) form
 * in the DCS platform for a newly created case.
 *
 * Key points:
 *  - Dynamically creates a new case with defendants and CPS prosecution
 *  - Uploads a PTPH form for the case via a helper (API endpoints)
 *  - Navigates to the PTPH form page and validates each form section visually
 *    using screenshot comparisons
 *  - Collects all visual mismatches and reports them collectively
 *  - Cleans up test cases after execution to prevent state pollution
 *
 * Notes:
 *  - Visual validation uses a strict threshold (maxDiffPixelRatio: 0.01) to catch layout changes
 */

test.describe("@nightly @regression PTPH Form Rendering / Photosnaps @ptph", () => {
  let newCaseUrn: string;
  let newCaseName: string;

  test.beforeEach(
    async ({
      homePage,
      caseSearchPage,
      caseDetailsPage,
      createCasePage,
      addDefendantPage,
      peoplePage,
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();

      // Create a new case with one defendant and CPS as prosecutor
      // Returns the new case name and URN for use in the test
      const uniqueIdentifier = createUniqueIdentifier(uuidv4());
      const newCase = await createNewCaseWithDefendantsAndUsers(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        uniqueIdentifier,
        "None", // No specific user access required
        "One", // Single defendant
        "CPS", // Prosecuted by CPS
      );
      newCaseUrn = newCase.newCaseUrn;
      newCaseName = newCase.newCaseName;
    },
  );

  test(`Render PTPH form`, async ({ sectionsPage, ptphPage, context }) => {
    const currentUserIssues: string[] = [];

    await uploadPTPHForm(context, newCaseUrn);

    await sectionsPage.caseNavigation.navigateTo("PTPH");
    await ptphPage.ptphFormLoad();
    await ptphPage.page.waitForTimeout(30000);

    const formSections = await ptphPage.ptphFormSections();

    for (const section of formSections) {
      try {
        // Compare live section screenshot with baseline image
        await expect(section.locator).toHaveScreenshot(`${section.name}.png`, {
          maxDiffPixelRatio: 0.01,
        });
        console.log(
          `Successful screenshot match found for PTPH section: ${section.name}`,
        );
      } catch {
        currentUserIssues.push(
          `Screenshot mismatch for PTPH form section: ${section.name}`,
        );
      }
    }
    // Aggregate and report all issues for this user
    pushTestResult({
      user: "HMCTSAdmin",
      heading: `Verify PTPH Rendering for HMCTSAdmin`,
      category: "PTPH",
      issues: currentUserIssues,
    });

    // Fail the test if any visual mismatches occurred
    if (currentUserIssues.length > 0) {
      throw new Error(`${currentUserIssues.join("\n")}`);
    }
  });

  //Cleanup: Remove dynamically created case
  test.afterEach(async () => {
    if (!newCaseName) return;

    await runCleanupSafely(async () => {
      console.log(
        `Attempting to delete test case: ${newCaseName} for Test: PTPH`,
      );
      await deleteCaseByName(newCaseName, 180_000);
    }, 180_000);
  });
});
