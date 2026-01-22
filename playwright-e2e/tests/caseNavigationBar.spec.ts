import { test, expect } from "../fixtures";
import { caseLinks } from "../data/navLinks";

const assertNavigation = {
  "same-page": async ({ page, caseDetailsPage }, link) => {
    await caseDetailsPage.caseNavigation.navigateTo(link.name);
    await expect(page).toHaveURL(new RegExp(link.expectedUrl));
    await expect(link.pageIdentifier(page)).toBeVisible({ timeout: 30000 });
  },

  popup: async ({ page, caseDetailsPage }, link) => {
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      caseDetailsPage.caseNavigation.navigateTo(link.name),
    ]);

    await expect(popup).toHaveURL(new RegExp(link.expectedUrl));
    await expect(link.pageIdentifier(popup)).toBeVisible({ timeout: 30000 });
    await popup.close();
  },
};

test.describe("@regression @nightly Case navigation links", () => {
  test.beforeEach(async ({ homePage, caseSearchPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await caseSearchPage.searchCaseFile("01AD111111", "Southwark");
    await caseSearchPage.goToUpdateCase("01AD111111");
  });

  test(`Navigate to each case navigation link`, async ({
    page,
    caseDetailsPage,
  }) => {
    for (const link of caseLinks) {
      await assertNavigation[link.mode]({ page, caseDetailsPage }, link);
      console.log(`Successful navigation to ${link.name} page`);
    }
  });
});
