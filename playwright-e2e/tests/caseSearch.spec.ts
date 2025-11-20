import { test, expect } from "../fixtures";
import ReviewEvidencePage from "../page-objects/pages/reviewEvidence.page";

test.describe("Search Auto Case 1 (Documents Testing) and navigate into case", () => {
  test.beforeEach(async ({ homePage, caseSearchPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
  });

  test("Update Case - Auto Case1", async ({
    caseSearchPage,
    caseDetailsPage,
  }) => {
    await caseSearchPage.goToUpdateCase("01AD111111");
    await expect(caseDetailsPage.caseNameHeading).toContainText(
      "Auto Case1 - DO NOT AMEND"
    );
    await expect(caseDetailsPage.caseDetailsHeading).toContainText(
      "Case Details"
    );
  });

  test("Update Front Page - Auto Case1", async ({
    caseSearchPage,
    updateFrontPage,
  }) => {
    await caseSearchPage.goToUpdateFrontPage("01AD111111");
    await expect(updateFrontPage.caseNameHeading).toContainText(
      "Auto Case1 - DO NOT AMEND"
    );
    await expect(updateFrontPage.changeDetailsHeading).toContainText(
      "Change Case Details"
    );
  });

  test("Review Evidence - Auto Case1", async ({ caseSearchPage }) => {
    const [popup] = await Promise.all([
      caseSearchPage.page.waitForEvent("popup"),
      caseSearchPage.goToReviewEvidence("01AD111111"),
    ]);

    const reviewEvidencePage = new ReviewEvidencePage(popup);
    await expect(reviewEvidencePage.caseName).toContainText(
      "Auto Case1 - DO NOT AMEND"
    );
    await popup.close();
  });
});

test.describe("Search Comment Case (Notes Testing) and navigate into case", () => {
  test.beforeEach(async ({ homePage, caseSearchPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await caseSearchPage.searchCaseFile("01SJ1111", "Southwark");
  });

  test("Update Case - Comment Case", async ({
    caseSearchPage,
    caseDetailsPage,
  }) => {
    await caseSearchPage.goToUpdateCase("01SJ1111");
    await expect(caseDetailsPage.caseNameHeading).toContainText(
      "Comment Case - DO NOT AMEND"
    );
    await expect(caseDetailsPage.caseDetailsHeading).toContainText(
      "Case Details"
    );
  });

  test("Update Front Page - Comment Case", async ({
    caseSearchPage,
    updateFrontPage,
  }) => {
    await caseSearchPage.goToUpdateFrontPage("01SJ1111");
    await expect(updateFrontPage.caseNameHeading).toContainText(
      "Comment Case - DO NOT AMEND"
    );
    await expect(updateFrontPage.changeDetailsHeading).toContainText(
      "Change Case Details"
    );
  });

  test("Review Evidence - Comment Case", async ({ caseSearchPage }) => {
    const [popup] = await Promise.all([
      caseSearchPage.page.waitForEvent("popup"),
      caseSearchPage.goToReviewEvidence("01SJ1111"),
    ]);

    const reviewEvidencePage = new ReviewEvidencePage(popup);
    await expect(reviewEvidencePage.caseName).toContainText(
      "Comment Case - DO NOT AMEND"
    );
    await popup.close();
  });
});
