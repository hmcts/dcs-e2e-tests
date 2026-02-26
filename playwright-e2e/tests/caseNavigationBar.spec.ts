import { test, expect } from "../fixtures";
import { caseLinks } from "../data/navLinks";

/**
 * Case Navigation Links
 * ---------------------
 *
 * This test validates all case-level navigation links shown within the
 * Case Details view (e.g. Sections, People, ROCA, Review).
 *
 * Why this test exists:
 * - Navigation regressions are common when routes, permissions, or layouts change
 * - A broken case navigation link blocks most user journeys
 * - Some links behave differently (same-page vs popup), which must be handled explicitly
 *
 * Design notes:
 * - Navigation behaviour is data-driven via `caseLinks` (see import)
 * - Each link declares:
 *    - its expected URL pattern
 *    - how navigation occurs (`same-page` or `popup`)
 *    - a `pageIdentifier` locator used to confirm the correct page loaded
 *
 * Important:
 * To avoid conditional logic inside the test, each link declares
 * its navigation mode and is validated using the corresponding strategy.
 *
 * Each strategy:
 * - triggers navigation
 * - asserts the expected URL pattern
 * - asserts a page-specific identifier is visible
 */

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

test.describe("@regression @nightly @smoke Case navigation links", () => {
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
