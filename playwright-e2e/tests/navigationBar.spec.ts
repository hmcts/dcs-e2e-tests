import { test as base } from "@playwright/test";
import {
  pageFixtures,
  PageFixtures,
} from "../page-objects/pages/page.fixtures";
export const test = base.extend<PageFixtures>(pageFixtures);
export const expect = test.expect;
import {
  internalLinksLoggedIn,
  internalLinksLoggedOut,
  externalLinks,
} from "../data/navLinks";
import { userConfig } from "../utils";

test.describe("Internal navigation links Logged Out", () => {
  for (const link of internalLinksLoggedOut) {
    test(`Navigate to ${link.name}`, async ({ page, homePage }) => {
      await homePage.open();
      await homePage.navigation.navigateTo(link.name);
      await expect(page).toHaveTitle(link.expectedTitle);
      expect(page.url()).toContain(link.expectedUrl);
    });
  }
});

test.describe("External navigation links Logged Out", () => {
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

test.describe.serial("Internal navigation links Logged In", () => {
  for (const link of internalLinksLoggedIn) {
    test(`Navigate to ${link.name}`, async ({ page, homePage, loginPage }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("LogOn");
      await loginPage.login(userConfig.users.hmctsAdmin);
      await loginPage.navigation.navigateTo(link.name);
      await expect(page).toHaveTitle(link.expectedTitle);
      expect(page.url()).toContain(link.expectedUrl);
    });
  }
});

// External links do not change based on user session, so testing logged-in state is unnecessary.
