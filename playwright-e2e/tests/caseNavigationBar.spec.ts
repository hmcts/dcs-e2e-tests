import { test, expect } from "../fixtures";
import { caseLinks } from "../data/navLinks";

test.describe.serial("Case navigation links", () => {
  test.beforeEach(async ({ homePage, caseListPage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("ViewCaseListLink");
    await caseListPage.searchCaseFile("01AD111111", "Southwark");
    await caseListPage.goToUpdateCase();
  });

  for (const link of caseLinks) {
    test(`Navigate to ${link.name}`, async ({ page, caseDetailsPage }) => {
      if (link.name === "Review") {
        const [newPage] = await Promise.all([
          page.waitForEvent("popup"),
          caseDetailsPage.caseNavigation.navigateTo("Review"),
        ]);
        expect(newPage.url()).toContain(link.expectedUrl);
        await newPage.close();
      } else {
        await caseDetailsPage.caseNavigation.navigateTo(link.name);
        expect(page.url()).toContain(link.expectedUrl);
      }
    });
  }
});
