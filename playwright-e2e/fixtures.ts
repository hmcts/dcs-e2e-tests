import { test as baseTest } from "@playwright/test";
import { PageFixtures, pageFixtures } from "./page-objects/pages";
import { UtilsFixtures, utilsFixtures } from "./utils";
import { config, UserCredentials } from "./utils";

// Filter eligible users (exclude admin-like groups)
const excludedGroups = ["AccessCoordinator", "Admin"];
export const eligibleUsers: UserCredentials[] = Object.values(
  config.users
).filter((u) => !excludedGroups.includes(u.group));

// Pick the first eligible user for nightly runs
const envUser = process.env.TEST_USER || "HMCTSAdmin";
export const currentUser: UserCredentials =
  eligibleUsers.find((u) => u.group === envUser) ?? eligibleUsers[0];

// Extend base test with fixtures
export type CustomFixtures = PageFixtures &
  UtilsFixtures & {
    currentUser: UserCredentials;
    eligibleUsers: UserCredentials[];
  };

export const test = baseTest.extend<CustomFixtures>({
  ...pageFixtures,
  ...utilsFixtures,

  // Provide currentUser and eligibleUsers to all tests
  currentUser: async ({}, use) => {
    await use(currentUser); // currentUser is just a constant
  },

  eligibleUsers: async ({}, use) => {
    await use(eligibleUsers); // same for eligibleUsers
  },
});

export const expect = test.expect;
