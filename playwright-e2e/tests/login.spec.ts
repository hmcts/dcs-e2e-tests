/* eslint-disable @typescript-eslint/no-unused-vars */
import { test as base } from "@playwright/test";
import {
  pageFixtures,
  PageFixtures,
} from "../page-objects/pages/page.fixtures";
export const test = base.extend<PageFixtures>(pageFixtures);
export const expect = test.expect;
import { UserCredentials, userConfig, invalidUsers } from "../utils";

test.describe("Successful login across User Groups", () => {
  for (const [roleKey, user] of Object.entries(userConfig.users) as [
    string,
    UserCredentials
  ][]) {
    test(`Login for User Group: ${user.group}`, async ({
      homePage,
      loginPage,
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("LogOn");
      await loginPage.login(user);
      await expect(loginPage.navigation.links["LogOff"]).toBeVisible();
      await expect(
        loginPage.navigation.links["ViewCaseListLink"]
      ).toBeVisible();
    });
  }
});

test.describe("Invalid login attempts", () => {
  for (const { scenario, username, password } of invalidUsers) {
    test(`Login should fail with ${scenario}`, async ({
      homePage,
      loginPage,
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("LogOn");
      await loginPage.invalidLogin(username, password);
      await expect(loginPage.errorMessage).toContainText(
        "The user name or password provided is incorrect"
      );
      await expect(loginPage.navigation.links["LogOn"]).toBeVisible();
    });
  }
});
