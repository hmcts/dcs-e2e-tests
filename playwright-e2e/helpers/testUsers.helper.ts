import { config } from "../utils";

/**
 * Returns users for a test run.
 *
 * Nightly  -> one random eligible user
 * Regression -> all eligible users
 */

export function getUsersForRun(excludedGroups: string[]) {
  const eligibleUsers = Object.values(config.users).filter(
    (u) => !excludedGroups.includes(u.group)
  );

  const scope = process.env.TEST_SCOPE || "nightly";

  if (scope === "regression") {
    return eligibleUsers;
  }

  // Nightly: pick ONE random user
  const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
  return [eligibleUsers[randomIndex]];
}
