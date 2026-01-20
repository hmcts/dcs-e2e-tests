/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "../fixtures";
import { UserCredentials, config, invalidUsers } from "../utils";

test.describe("@nightly @regression Successful login across User Groups", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
  });

  for (const [roleKey, user] of Object.entries(config.users) as [
    string,
    UserCredentials
  ][]) {
    test(`Login for User Group: ${user.group}`, async ({ loginPage }) => {
      await loginPage.login(user);
      await expect(loginPage.navigation.links["LogOff"]).toBeVisible();
      await expect(
        loginPage.navigation.links["ViewCaseListLink"]
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
