import { test, expect, currentUser, eligibleUsers } from "../fixtures";
import { pushTestResult } from "../utils";
import ReviewEvidencePage from "../page-objects/pages/case/reviewEvidence/reviewEvidence.page";

/**
 * Notes Feature – End-to-End Validation (Visibility & Access Control)
 * ------------------------------------ 
 *
 * This test suite validates the Notes functionality on case documents, 
 * specifically covering:
 *
 * 2) Notes visibility and access control across user roles
 *
 * The tests are intentionally data-driven and role-aware, ensuring:
 *  - Users only see Notes they are permitted to see
 *
 * TEST_USERS env variable:
 *  - nightly     → current user only (fast feedback)
 *  - regression  → all eligible users (full coverage)
 */

const TEST_USERS = process.env.TEST_USERS || "nightly";
// Please update TEST_USERS=regression locally to run all users

// ============================================================ 
// Test 2: Notes Visibility & Access Control
// ============================================================ 
//
// As a user
// I should only see Notes that I am permitted to see
// based on my role and the note's share type
//
// This test validates:
//  - No missing notes (underexposure)
//  - No unexpected notes (overexposure)

test.describe("@nightly @regression Notes Visibility & Access Control", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const usersToTest = TEST_USERS === "nightly" ? [currentUser] : eligibleUsers;

  for (const user of usersToTest) {
    test(`Verify access to Notes for: ${user.group}`, async ({
      loginPage,
      homePage,
      caseSearchPage,
    }) => {
      const currentUserIssues: string[] = [];

      await loginPage.login(user);
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
      const [popup] = await Promise.all([
        caseSearchPage.page.waitForEvent("popup"),
        caseSearchPage.goToReviewEvidence("01AD111111"),
      ]);

      const reviewEvidencePage = new ReviewEvidencePage(popup);
      await reviewEvidencePage.sectionPanelLoad();
      await expect
        .poll(
          async () => {
            return await reviewEvidencePage.notes.getNotesCount();
          },
          { timeout: 20000 },
        )
        .toBeGreaterThan(0);

      // Filter expected documents based on User Group
      const expectedNotes = await reviewEvidencePage.notes.filterNotesByUser(
        user.group,
      );

      // Get all available Notes for User
      const availableNotes = await reviewEvidencePage.notes.getAllNotes();

      // Compare expected Notes (based on role permissions)
      // against actual Notes rendered in the UI
      const { missingNotes, unexpectedNotes } = 
        await reviewEvidencePage.notes.compareExpectedVsAvailableNotes(
          expectedNotes,
          availableNotes,
        );

      // Collect any validation issues instead of failing immediately
      // This allows us to report all Notes inconsistencies in a single run
      currentUserIssues.push(...missingNotes, ...unexpectedNotes);

      //Aggregate results across users
      pushTestResult({
        user: user.group,
        heading: `Verify Notes Access for ${user.group}`,
        category: "Notes",
        issues: currentUserIssues,
      });

      // Fail the test if any issues were found
      if (currentUserIssues.length > 0) {
        throw new Error(
          `User ${ 
            user.group 
          } has missing/unexpected Notes:\n${currentUserIssues.join("\n")}`,
        );
      }
    });
  }
});
