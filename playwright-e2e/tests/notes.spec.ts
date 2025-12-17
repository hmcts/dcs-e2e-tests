import { test, expect } from "../fixtures";
import { config, pushTestResult } from "../utils";
import { createNewCaseWithUnrestrictedDocument } from "../helpers/createCase.helper";
import { loginAndOpenCase } from "../helpers/login.helper";
import { deleteCaseByName } from "../helpers/deleteCase.helper";
import ReviewEvidencePage from "../page-objects/pages/Review Evidence/reviewEvidence.page";

test.describe.configure({ mode: "serial" });

// ======================================================================
// Test 1: Create, Delete, Edit Note
// ======================================================================

// As any user
// I want to be able to add a note of any share type (Widely Shared, Tightly Shared, Private) on a document I have access to
// So that I can share information with relevant parties for a specific document

// As any user
// I want to be able to edit or remove my notes of any share type (Widely Shared, Tightly Shared, Private) on a document I have access to
// So that I can ensure up to date information is shared, to the right parties on a document.

const excludedGroups = [
  "AccessCoordinator",
  "Admin",
  "DefenceAdvocateB",
  "DefenceAdvocateC",
];

for (const user of Object.values(config.users).filter(
  (u) => !excludedGroups.includes(u.group)
)) {
  test.describe(`Notes Functionality for ${user.group} @notes`, () => {
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
          user.group
        );

        sampleKey = newCase.sampleKey as [string, string][];
        newCaseName = newCase.newCaseName;

        await sectionsPage.navigation.navigateTo("LogOff");
      }
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
        newCaseName
      );

      const popup = await caseDetailsPage.openReviewPopupAwaitPagination();
      const reviewEvidencePage = new ReviewEvidencePage(popup);

      const sectionKey = sampleKey[0][0];
      await reviewEvidencePage.sectionPanelLoad();
      await reviewEvidencePage.notes.waitForHighResImageLoad(sectionKey);
      await reviewEvidencePage.notes.openNotes();

      const types = await reviewEvidencePage.notes.addNotesForUserGroup(
        user.group,
        user.username
      );

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
        notes
      );

      // Delete Note
      await reviewEvidencePage.notes.deleteNote();
      try {
        const notesWithDeletion = await reviewEvidencePage.notes.getAllNotes();
        expect(notesWithDeletion).toEqual(notes.slice(1));
      } catch {
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
            { timeout: 10000 }
          )
          .toBe(`Edited note for ${user.group}`);
      } catch {
        currentUserIssues.push(`Edit of note failed for ${user.group}`);
      }

      pushTestResult({
        user: user.group,
        heading: `Verify Notes Functionality for ${user.group}`,
        category: "Notes",
        issues: currentUserIssues,
      });

      if (currentUserIssues.length > 0) {
        // throw new Error(
        //   `User ${user.group} experienced issues:\n${currentUserIssues.join(
        //     "\n"
        //   )}`
        // );
        test.fail(
          true,
          `Issues found for ${user.group}:\n${currentUserIssues.join("\n")}`
        );
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
}

// // ============================================================
// // Test 2: Notes Access Permissions
// // ============================================================

// // As a user
// // I want be able to see a list of the correct available Notes for an existing case as per my user permissions
// // So I don't get exposed to information outside of my remit that could impact the case integrity

test.describe("Notes Permissions & Access", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  const excludedGroups = ["AccessCoordinator", "Admin"];

  for (const user of Object.values(config.users).filter(
    (user) => !excludedGroups.includes(user.group)
  )) {
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
          { timeout: 20000 }
        )
        .toBeGreaterThan(0);

      // Filter expected documents based on User Group
      const expectedNotes = await reviewEvidencePage.notes.filterNotesByUser(
        user.group
      );

      // Get all available Notes for User
      const availableNotes = await reviewEvidencePage.notes.getAllNotes();

      // Compare expected vs available Notes for the User
      const { missingNotes, unexpectedNotes } =
        await reviewEvidencePage.notes.compareExpectedVsAvailableNotes(
          expectedNotes,
          availableNotes
        );

      // If there are any issues, push to currentUserIssues
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
        // throw new Error(
        //   `User ${
        //     user.group
        //   } has missing/unexpected Notes:\n${currentUserIssues.join("\n")}`
        // );
        test.fail(
          true,
          `Issues found for ${user.group}:\n${currentUserIssues.join("\n")}`
        );
      }
    });
  }
});
