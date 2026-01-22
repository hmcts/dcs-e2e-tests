import { test, expect } from "../fixtures";
import {
  internalLinksLoggedIn,
  internalLinksLoggedOut,
  externalLinks,
} from "../data/navLinks";
import { config } from "../utils";

test.describe("@nightly @regression Internal navigation links logged out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test(`Navigate to available internal links while logged out`, async ({
    page,
    homePage,
  }) => {
    for (const link of internalLinksLoggedOut) {
      await homePage.open();
      await homePage.navigation.navigateTo(link.name);
      await expect(page).toHaveTitle(link.expectedTitle);
      expect(page.url().toLowerCase()).toContain(
        link.expectedUrl.toLowerCase(),
      );
      console.log(`Successful navigation to ${link.name}`);
    }
  });
});

// External links do not change based on user session, so testing can occur in either state
test.describe("@nightly @regression External navigation links", () => {
  test(`Navigate to available links external to the platform`, async ({
    page,
    homePage,
  }) => {
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

test.describe("@nightly @regression Internal navigation links Logged In", () => {
  test(`Navigate to available internal links while logged in`, async ({
    page,
    homePage,
    loginPage,
  }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOff");
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.login(config.users.accessCoordinator);
    for (const link of internalLinksLoggedIn) {
      await homePage.navigation.navigateTo(link.name);
      await expect(page).toHaveTitle(link.expectedTitle);
      expect(page.url()).toContain(link.expectedUrl);
      console.log(`Successful navigation to ${link.name}`);
    }
  });
});
