import { test as baseTest } from "@playwright/test";
import { PageFixtures, pageFixtures } from "./page-objects/pages";
import { UtilsFixtures, utilsFixtures } from "./utils";
import { config, UserCredentials } from "./utils";

/**
 * @file This file defines custom Playwright fixtures for the test suite.
 * It extends the base `test` object with page objects, utility functions,
 * and, most importantly, provides the user lists for multi-user testing strategies.
 * See the main `README.md` for a full explanation of the "Dynamic Test Generation" pattern.
 */

// Filter eligible users for regression runs, excluding admin-like roles
// that may have overly broad permissions and skew test results.
const excludedGroups = ["AccessCoordinator", "Admin"];
export const eligibleUsers: UserCredentials[] = Object.values(
  config.users
).filter((u) => !excludedGroups.includes(u.group));

// Determine the single user for a nightly run.
// This reads the `TEST_USER` environment variable set by the Jenkins pipeline during user rotation.
// For local runs where `TEST_USER` is not set, it defaults to `HMCTSAdmin`.
const envUser = process.env.TEST_USER || "HMCTSAdmin";
export const currentUser: UserCredentials =
  eligibleUsers.find((u) => u.group === envUser) ?? eligibleUsers[0];

// Extend base test with all custom fixtures.
export type CustomFixtures = PageFixtures &
  UtilsFixtures & {
    currentUser: UserCredentials;
    eligibleUsers: UserCredentials[];
  };

export const test = baseTest.extend<CustomFixtures>({
  ...pageFixtures,
  ...utilsFixtures,

  // Provide the `currentUser` object to all tests.
  // Used by tests running with the "Dynamic Test Generation" pattern when TEST_USERS=nightly.
  currentUser: async ({}, use) => {
    await use(currentUser);
  },

  // Provide the `eligibleUsers` array to all tests.
  // Used by tests running with the "Dynamic Test Generation" pattern when TEST_USERS=regression.
  eligibleUsers: async ({}, use) => {
    await use(eligibleUsers);
  },
});

export const expect = test.expect;
