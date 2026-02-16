import { test, expect } from "../fixtures";
import ReviewEvidencePage from "../page-objects/pages/case/reviewEvidence/reviewEvidence.page";

/**
 * Case Search & Entry
 * -------------------
 *
 * This file validates that known, stable test cases can be:
 *  - located via Case Search
 *  - entered via all primary entry points
 *  - navigated without errors
 *
 * Covered entry points:
 *  - Update Case (Case Details)
 *  - Update Front Page
 *  - Review Evidence (opens in a new window)
 *
 * Test data notes:
 * - The cases used here ("Auto Case1" and "Comment Case") are
 *   long-lived regression fixtures and MUST NOT be amended.
 * - These cases are intentionally reused across multiple test suites.
 *
 * Scope:
 * - They ensure core navigation and routing into existing cases
 *   remains functional.
 */

const cases = [
  { URN: "01AD111111", name: "Auto Case1 - DO NOT AMEND" },
  { URN: "01SJ1111", name: "Comment Case - DO NOT AMEND" },
];

test.describe("@regression @nightly @smoke Case search and navigation for existing cases", () => {
  for (const caseDetails of cases) {
    test.beforeEach(async ({ homePage }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
    });

    test(`Search and Navigate to Update Case Details: ${caseDetails.name}`, async ({
      caseSearchPage,
      caseDetailsPage,
    }) => {
      await caseSearchPage.searchCaseFile(caseDetails.URN, "Southwark");
      await caseSearchPage.goToUpdateCase(caseDetails.URN);
      await expect(caseDetailsPage.caseNameHeading).toContainText(
        caseDetails.name,
      );
      await expect(caseDetailsPage.caseDetailsHeading).toContainText(
        "Case Details",
      );
    });

    test(`Search and Navigate to Update Front Page: ${caseDetails.name}`, async ({
      caseSearchPage,
      updateFrontPage,
    }) => {
      await caseSearchPage.searchCaseFile(caseDetails.URN, "Southwark");
      await caseSearchPage.goToUpdateFrontPage(caseDetails.URN);
      await expect(updateFrontPage.caseNameHeading).toContainText(
        caseDetails.name,
      );
      await expect(updateFrontPage.changeDetailsHeading).toContainText(
        "Change Case Details",
      );
    });

    test(`Search and Navigate to Review Evidence: ${caseDetails.name}`, async ({
      caseSearchPage,
    }) => {
      await caseSearchPage.searchCaseFile(caseDetails.URN, "Southwark");
      // Review Evidence opens in a new window
      const [popup] = await Promise.all([
        caseSearchPage.page.waitForEvent("popup"),
        caseSearchPage.goToReviewEvidence(caseDetails.URN),
      ]);

      const reviewEvidencePage = new ReviewEvidencePage(popup);
      await expect(reviewEvidencePage.caseName).toContainText(
        caseDetails.name,
        {},
      );
      await popup.close();
    });
  }
});
