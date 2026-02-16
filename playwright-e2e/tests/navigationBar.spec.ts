import { test, expect } from "../fixtures";
import {
  publicNavigationLinks,
  authenticatedNavigationLinks,
  externalLinks,
} from "../data/navLinks";
import { config } from "../utils";

/**
 * Global Navigation Validation
 * ----------------------------
 *
 * These tests validate platform-level navigation behaviour across
 * different authentication states:
 *
 *  - Logged out (public/internal links)
 *  - Logged in (role-gated internal links)
 *  - External links (open in a new tab and are session-agnostic)
 *
 * Navigation is validated using:
 *  - Page title assertions (high-level page identity)
 *  - URL assertions (correct routing)
 *
 */

test.describe("@nightly @regression @smoke Internal navigation links logged out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(`Navigate to available internal links while logged out`, async ({
    page,
    homePage,
  }) => {
    await homePage.open();
    for (const link of publicNavigationLinks) {
      await homePage.navigation.navigateTo(link.name);
      await expect(page).toHaveTitle(link.expectedTitle);
      expect(page.url().toLowerCase()).toContain(
        link.expectedUrl.toLowerCase(),
      );
      console.log(`Successful navigation to ${link.name}`);
    }
  });
});

// External links always open in a new browser tab/window
// and do not alter the current session or page state
test.describe("@nightly @regression @smoke External navigation links", () => {
  test(`Navigate to available links external to the platform`, async ({
    page,
    homePage,
  }) => {
    // Reload home page for each link to ensure clean unauthenticated state
    await homePage.open();
    for (const link of externalLinks) {
      await homePage.navigation.navigateTo(link.name);
      const [newPage] = await Promise.all([
        page.waitForEvent("popup"),
        homePage.navigation.navigateTo(link.name),
      ]);
      await expect(newPage).toHaveURL(link.expectedUrl);
      await newPage.close();
      await expect(page).toHaveTitle(link.expectedTitle);
      console.log(`Successful navigation to ${link.name}`);
    }
  });
});

test.describe("@nightly @regression @smoke Internal navigation links Logged In", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(`Navigate to available internal links while logged in`, async ({
    page,
    homePage,
    loginPage,
  }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
    // Login as Access Coordinator to validate full internal navigation set
    // including Administrative links
    await loginPage.login(config.users.accessCoordinator);
    for (const link of authenticatedNavigationLinks) {
      await homePage.navigation.navigateTo(link.name);
      await expect(page).toHaveTitle(link.expectedTitle);
      expect(page.url()).toContain(link.expectedUrl);
      console.log(`Successful navigation to ${link.name}`);
    }
  });
});
