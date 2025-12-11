import { test, expect } from "../fixtures";
import { pushTestResult } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { uploadPTPHForm } from "../helpers/ptph.helper";

// ============================================================
// Test 1: PTPH Form Rendering
// ============================================================

// As a user
// When I upload a PTPH form into the DCS platform
// This should be accurately displayed on the virtual PTPH form for the relevant case

test.describe("PTPH Form Rendering / Photosnaps @ptph", () => {
  let newCaseUrn: string;

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

      const newCase = await createNewCaseWithDefendantsAndUsers(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        "TestCase",
        "TestURN",
        "None",
        "One",
        "CPS"
      );
      newCaseUrn = newCase.newCaseUrn;
    }
  );

  test(`Render PTPH form`, async ({ sectionsPage, ptphPage, context }) => {
    const currentUserIssues: string[] = [];

    await uploadPTPHForm(context, newCaseUrn);

    try {
      await sectionsPage.caseNavigation.navigateTo("PTPH");

      const ptphTable = ptphPage.ptphForm;

      const screenshotName = `ptph-form.png`;

      // Take and compare screenshot to expected document image
      try {
        await expect(ptphTable).toHaveScreenshot(screenshotName, {
          maxDiffPixelRatio: 0.01,
        });
      } catch {
        currentUserIssues.push(`Screenshot mismatch for PTPH form`);
      }
    } catch (error: unknown) {
      console.error(`Error during PTPH rendering:`, error);
    } finally {
      // Aggregate results
      pushTestResult({
        user: "HMCTSAdmin",
        heading: `Verify PTPH Rendering for HMCTSAdmin`,
        category: "PTPH",
        issues: currentUserIssues,
      });

      // Fail the test if any issues were found
      if (currentUserIssues.length > 0) {
        throw new Error(`${currentUserIssues.join("\n")}`);
      }
    }
  });
});
