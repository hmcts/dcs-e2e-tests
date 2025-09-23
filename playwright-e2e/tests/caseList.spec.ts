import { test as base, expect } from "@playwright/test";
import { pageFixtures, PageFixtures } from "../page-objects/pages";
import { userConfig } from "../utils";
import ReviewEvidencePage from "../page-objects/pages/reviewEvidence.page";

export const test = base.extend<PageFixtures>(pageFixtures);

test.describe("Search Auto Case 1 (Documents Testing) and navigate into case", () => {
  test.beforeEach(async ({ homePage, loginPage, caseListPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.login(userConfig.users.hmctsAdmin);
    await loginPage.navigation.navigateTo("ViewCaseListLink");
    await caseListPage.searchCaseFile("01AD111111", "Southwark");
  });

  test("Update Case - Auto Case1", async ({
    caseListPage,
    caseDetailsPage,
  }) => {
    await caseListPage.goToUpdateCase();
    await expect(caseDetailsPage.caseNameHeading).toContainText(
      "Auto Case1 - DO NOT AMEND"
    );
    await expect(caseDetailsPage.caseDetailsHeading).toContainText(
      "Case Details"
    );
  });

  test("Update Front Page - Auto Case1", async ({
    caseListPage,
    updateFrontPage,
  }) => {
    await caseListPage.goToUpdateFrontPage();
    await expect(updateFrontPage.caseNameHeading).toContainText(
      "Auto Case1 - DO NOT AMEND"
    );
    await expect(updateFrontPage.changeDetailsHeading).toContainText(
      "Change Case Details"
    );
  });

  test("Review Evidence - Auto Case1", async ({ caseListPage }) => {
    const [popup] = await Promise.all([
      caseListPage.page.waitForEvent("popup"),
      caseListPage.goToReviewEvidence(),
    ]);

    const reviewEvidencePage = new ReviewEvidencePage(popup);
    await expect(reviewEvidencePage.caseNameHeading).toContainText(
      "Auto Case1 - DO NOT AMEND"
    );
    await popup.close();
  });
});

test.describe("Search Comment Case (Notes Testing) and navigate into case", () => {
  test.beforeEach(async ({ homePage, loginPage, caseListPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.login(userConfig.users.hmctsAdmin);
    await loginPage.navigation.navigateTo("ViewCaseListLink");
    await caseListPage.searchCaseFile("01SJ1111", "Southwark");
  });

  test("Update Case - Comment Case", async ({
    caseListPage,
    caseDetailsPage,
  }) => {
    await caseListPage.goToUpdateCase();
    await expect(caseDetailsPage.caseNameHeading).toContainText(
      "Comment Case - DO NOT AMEND"
    );
    await expect(caseDetailsPage.caseDetailsHeading).toContainText(
      "Case Details"
    );
  });

  test("Update Front Page - Comment Case", async ({
    caseListPage,
    updateFrontPage,
  }) => {
    await caseListPage.goToUpdateFrontPage();
    await expect(updateFrontPage.caseNameHeading).toContainText(
      "Comment Case - DO NOT AMEND"
    );
    await expect(updateFrontPage.changeDetailsHeading).toContainText(
      "Change Case Details"
    );
  });

  test("Review Evidence - Comment Case", async ({ caseListPage }) => {
    const [popup] = await Promise.all([
      caseListPage.page.waitForEvent("popup"),
      caseListPage.goToReviewEvidence(),
    ]);

    const reviewEvidencePage = new ReviewEvidencePage(popup);
    await expect(reviewEvidencePage.caseNameHeading).toContainText(
      "Comment Case - DO NOT AMEND"
    );
    await popup.close();
  });
});
