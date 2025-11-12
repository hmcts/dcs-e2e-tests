import { test, expect } from "../fixtures";
import {
  internalLinksLoggedIn,
  internalLinksLoggedOut,
  externalLinks,
} from "../data/navLinks";

test.describe("Internal navigation links Logged Out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  for (const link of internalLinksLoggedOut) {
    test(`Navigate to ${link.name}`, async ({ page, homePage }) => {
      await homePage.open();
      await homePage.navigation.navigateTo(link.name);
      await expect(page).toHaveTitle(link.expectedTitle);
      expect(page.url().toLowerCase()).toContain(
        link.expectedUrl.toLowerCase()
      );
    });
  }
});

// External links do not change based on user session, so testing can occur in either state
test.describe("External navigation links", () => {
  for (const link of externalLinks) {
    test(`Navigate to ${link.name}`, async ({ page, homePage }) => {
      await homePage.open();
      await homePage.navigation.navigateTo(link.name);
      const [newPage] = await Promise.all([
        page.waitForEvent("popup"),
        homePage.navigation.navigateTo(link.name),
      ]);
      await expect(newPage).toHaveURL(link.expectedUrl);
      await newPage.close();
      await expect(page).toHaveTitle(link.expectedTitle);
    });
  }
});

const excludedLinksForAdmin = ["ApprovalRequests", "Admin"];

test.describe.serial("Internal navigation links Logged In", () => {
  for (const link of internalLinksLoggedIn.filter(
    (l) => !excludedLinksForAdmin.includes(l.name)
  )) {
    test(`Navigate to ${link.name}`, async ({ page, homePage }) => {
      await homePage.open();
      await homePage.navigation.navigateTo(link.name);
      await expect(page).toHaveTitle(link.expectedTitle);
      expect(page.url()).toContain(link.expectedUrl);
    });
  }
});
