/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "../fixtures";
import { UserCredentials, config, invalidUsers } from "../utils";

/**
 * Authentication – Login Validation
 * ---------------------------------
 *
 * This file validates the CCDCS login journey across multiple scenarios:
 *
 * 1. Successful login for all configured user groups
 * 2. Failed login attempts using invalid credentials
 * 3. Form validation errors when required fields are missing
 *
 * The tests are fully data-driven and iterate over centrally defined
 * user credentials to ensure consistent coverage as roles evolve.
 *
 * Key principles:
 * - No shared session state between tests
 * - Clear separation between positive and negative login paths
 * - Assertions focus on post-login navigation visibility rather than URL
 *   as the Homepage URL remains the same
 */

test.describe("@nightly @regression Successful login across User Groups", () => {
  // Ensure each test starts unauthenticated by clearing all session state
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  /**
   * Iterate over all configured user roles to validate successful login.
   */
  for (const [roleKey, user] of Object.entries(config.users) as [
    string,
    UserCredentials,
  ][]) {
    test(`Login for User Group: ${user.group}`, async ({ loginPage }) => {
      await loginPage.login(user);
      await expect(loginPage.navigation.links["LogOff"]).toBeVisible();
      await expect(
        loginPage.navigation.links["ViewCaseListLink"],
      ).toBeVisible();
    });
  }
});

test.describe("@nightly @regression Invalid login attempts", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  for (const { scenario, username, password } of invalidUsers) {
    test(`Login should fail with ${scenario}`, async ({ loginPage }) => {
      await loginPage.invalidLogin(username, password);
      await expect(loginPage.loginErrorMessage).toBeVisible();
      await expect(loginPage.navigation.links["LogOn"]).toBeVisible();
    });
  }
});

test.describe("@nightly @regression Missing login fields", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  test(`Blank username generates error that field is missing`, async ({
    loginPage,
  }) => {
    await loginPage.invalidLogin("", "password");
    await expect(loginPage.usernameErrorMessage).toBeVisible();
    await expect(loginPage.navigation.links["LogOn"]).toBeVisible();
  });

  test(`Blank password generates error that field is missing`, async ({
    loginPage,
  }) => {
    await loginPage.invalidLogin("username", "");
    await expect(loginPage.passwordErrorMessage).toBeVisible();
    await expect(loginPage.navigation.links["LogOn"]).toBeVisible();
  });
});
