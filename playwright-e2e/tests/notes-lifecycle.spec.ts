import { test, expect, currentUser, eligibleUsers } from "../fixtures";
import { pushTestResult } from "../utils";
import { createNewCaseWithUnrestrictedDocument } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import {
  deleteCaseByName,
  runCleanupSafely,
} from "../helpers/deleteCase.helper";
import ReviewEvidencePage from "../page-objects/pages/case/reviewEvidence/reviewEvidence.page";

/**
 * Notes Feature – End-to-End Validation (Lifecycle)
 * ------------------------------------
 *
 * This test suite validates the Notes functionality on case documents,
 * specifically covering:
 *
 * 1) Notes lifecycle behaviour (create, edit, delete)
 *
 * The tests are intentionally data-driven and role-aware, ensuring:
 *  - Notes of all share types (Widely Shared, Tightly Shared, Private)
 *    behave correctly
 *  - Users only see Notes they are permitted to see
 *  - Changes are isolated per user and per case
 *
 * Tests dynamically create and clean up cases to ensure isolation
 * and avoid reliance on shared state.
 *
 * TEST_USERS env variable:
 *  - nightly     → current user only (fast feedback)
 *  - regression  → all eligible users (full coverage)
 */

const TEST_USERS = process.env.TEST_USERS || "nightly";
// Please update TEST_USERS=regression locally to run all users

// ----------------------------------------------
// Test 1: Notes Lifecycle (Create, Edit, Delete)
// ----------------------------------------------
//
// As any user
// I want to add notes of any share type on a document I can access
// So that I can communicate relevant information to appropriate parties
//
// As any user
// I want to edit or remove my own notes
// So that shared information remains accurate and current

test.describe("@regression @nightly @notes-lifecycle Notes Lifecycle", () => {
  // Select users dynamically based on execution scope
  // Nightly runs are intentionally limited for speed
  const usersToTest = TEST_USERS === "nightly" ? [currentUser] : eligibleUsers;

  for (const user of usersToTest) {
    test.describe(`Notes Functionality for ${user.group}`, () => {
      let sampleKey: [string, string][];
      let newCaseName: string;

      test.beforeEach(
        async ({
          homePage,
          caseSearchPage,
          caseDetailsPage,
          createCasePage,
          addDefendantPage,
          peoplePage,
          sectionsPage,
          sectionDocumentsPage,
          rocaPage,
        }) => {
          await homePage.open();
          await homePage.navigation.navigateTo("ViewCaseListLink");
          await caseSearchPage.goToCreateCase();

          const newCase = await createNewCaseWithUnrestrictedDocument(
            createCasePage,
            caseDetailsPage,
            addDefendantPage,
            peoplePage,
            sectionsPage,
            sectionDocumentsPage,
            rocaPage,
            "TestCase",
            "TestURN",
            user.group,
          );

          sampleKey = newCase.sampleKey as [string, string][];
          newCaseName = newCase.newCaseName;

          // Log out after case setup so each test can log in
          // as the target user and validate role-specific behaviour
          await sectionsPage.navigation.navigateTo("LogOff");
        },
      );

      test(`Create, Delete and Edit Notes on Document for ${user.group}`, async ({ 
        homePage,
        loginPage,
        caseSearchPage,
        caseDetailsPage,
      }) => {
        const currentUserIssues: string[] = [];

        await loginAndOpenCase(
          homePage,
          loginPage,
          caseSearchPage,
          user,
          newCaseName,
        );

        const popup = await caseDetailsPage.openReviewPopupAwaitPagination();
        const reviewEvidencePage = new ReviewEvidencePage(popup);

        const sectionKey = sampleKey[0][0];
        await reviewEvidencePage.sectionPanelLoad();
        await reviewEvidencePage.notes.waitForHighResImageLoad(sectionKey);
        await reviewEvidencePage.notes.openNotes();

        const types = await reviewEvidencePage.notes.addNotesForUserGroup(
          user.group,
          user.username,
        );

        // DefenceAdvocateA receives an additional tightly shared note
        // due to representation-based visibility rules
        if (user.group === "DefenceAdvocateA") {
          await expect
            .poll(() => reviewEvidencePage.notes.getNotesCount(), { 
              timeout: 30000,
            })
            .toBe(4);
        } else {
          await expect
            .poll(() => reviewEvidencePage.notes.getNotesCount(), { 
              timeout: 30000,
            })
            .toBe(3);
        }

        const notes = await reviewEvidencePage.notes.getAllNotes();
        await reviewEvidencePage.notes.validateNotes(
          currentUserIssues,
          user,
          types,
          notes,
        );

        // Delete Note
        await reviewEvidencePage.notes.deleteNote();
        try {
          const notesWithDeletion =
            await reviewEvidencePage.notes.getAllNotes();
          expect(notesWithDeletion).toEqual(notes.slice(1));
        } catch {
          // Collect all validation issues before failing
          // to provide comprehensive feedback per user role
          currentUserIssues.push(`Deletion of note failed for ${user.group}`);
        }

        // Edit Note
        await reviewEvidencePage.notes.editNote(user.group);
        try {
          await expect
            .poll(
              async () =>
                await reviewEvidencePage.notes.stickyNotes
                  .last()
                  .locator(".commentText")
                  .innerText(),
              { timeout: 10000 },
            )
            .toBe(`Edited note for ${user.group}`);
        } catch {
          // Collect all validation issues before failing
          // to provide comprehensive feedback per user role
          currentUserIssues.push(`Edit of note failed for ${user.group}`);
        }

        pushTestResult({
          user: user.group,
          heading: `Verify Notes Functionality for ${user.group}`,
          category: "Notes",
          issues: currentUserIssues,
        });

        if (currentUserIssues.length > 0) {
          throw new Error(
            `User ${user.group} experienced issues:\n${currentUserIssues.join(
              "\n",
            )}`,
          );
        }
      });

      // Cleanup is wrapped defensively to prevent test failures
      // caused by intermittent UI flakiness during case deletion
      test.afterEach(async () => {
        if (!newCaseName) return;

        await runCleanupSafely(async () => {
          console.log(`Attempting to delete test case: ${newCaseName}`);
          await deleteCaseByName(newCaseName, 180_000);
          console.log(`Cleanup completed for ${newCaseName}`);
        }, 180_000);
      });
    });
  }
});
