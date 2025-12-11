import { test, expect } from "../fixtures";
import { pushTestResult } from "../utils";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { uploadPTPHForm } from "../helpers/ptph.helper";
import { deleteCaseByName } from "../helpers/deleteCase.helper";

// ============================================================
// Test 1: PTPH Form Rendering
// ============================================================

// As a user
// When I upload a PTPH form into the DCS platform
// This should be accurately displayed on the virtual PTPH form for the relevant case

test.describe("PTPH Form Rendering / Photosnaps @ptph", () => {
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
      newCaseName = newCase.newCaseName;
    }
  );

  test(`Render PTPH form`, async ({ sectionsPage, ptphPage, context }) => {
    const currentUserIssues: string[] = [];

    await uploadPTPHForm(context, newCaseUrn);

    await sectionsPage.caseNavigation.navigateTo("PTPH");

    const ptphForm = ptphPage.ptphForm;
    await expect(ptphForm).toBeVisible();
    await ptphPage.page.waitForTimeout(30000);

    const formSections = await ptphPage.ptphFormSections();

    await ptphPage.page.waitForTimeout(60000);

    for (const section of formSections) {
      // Take and compare screenshot to expected form section
      try {
        await expect(section.locator).toHaveScreenshot(`${section.name}.png`, {
          maxDiffPixelRatio: 0.01,
        });
        console.log(
          `Successful screenshot match found for PTPH section: ${section.name}`
        );
      } catch {
        currentUserIssues.push(
          `Screenshot mismatch for PTPH form section: ${section.name}`
        );
      }
    }
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
  });

  test.afterEach(async () => {
    if (!newCaseName) return;

    try {
      console.log(`Attempting to delete test case: ${newCaseName}`);

      // Run cleanup with timeout
      await Promise.race([
        deleteCaseByName(newCaseName, 180000),
        new Promise<void>((resolve) =>
          setTimeout(() => {
            console.warn(
              `⚠️ Cleanup for ${newCaseName} timed out after 3 minutes`
            );
            resolve();
          }, 180000)
        ),
      ]);
    } catch (err) {
      console.warn(`⚠️ Cleanup failed for ${newCaseName}:`, err);
    }
  });
});
