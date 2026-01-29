import { config } from "../utils";
import { expect } from "../fixtures";
import { sections } from "../utils";
import { ROCAModel } from "../data/ROCAModel";
import { getRandomSectionKey } from "../utils";

/**
 * Case creation helpers
 * ---------------------
 * These helpers are responsible for creating fully-formed test cases via the UI,
 * including:
 *  - case creation
 *  - defendant setup
 *  - role-based user access
 *  - optional document upload and ROCA validation
 *
 * UI flows are used rather than direct data seeding as API endpoints don't exist
 * to support this.
 */

/**
 * Mapping of user roles to the defendants they should be associated with
 * when added to a case. This configuration helps in setting up specific
 * access control scenarios for different test users.
 */
const userRoleConfig = {
  DefenceAdvocateA: { defendants: ["Defendant One"] },
  DefenceAdvocateB: { defendants: ["Defendant Two"] },
  DefenceAdvocateC: { defendants: ["Defendant One", "Defendant Two"] },
  Admin: {},
  ProbationStaff: {},
  FullTimeJudge: {},
  CPSAdmin: {},
  CPSProsecutor: {},
};

/**
 * Preset user groups that comprise multiple roles.
 * This object is used to easily select a collection of users for a test case,
 * simplifying the process of assigning multiple user types for complex scenarios.
 */
const groupPreset = {
  Defence: [
    "defenceAdvocateA",
    "defenceAdvocateB",
    "defenceAdvocateC",
    "admin",
  ],
};

/**
 * Resolves users or user group into an array of user accounts to
 * be added to a test case
 *
 * Behaviour:
 *  - Accepts either a single user role or a group preset
 *  - Excludes the HMCTS admin as they created the case
 *  - Always ensures an admin user is present for cleanup and deletion
 */
export function getUserDetails(input: string) {
  // Find key in config.users ignoring case
  const userKey = Object.keys(config.users).find(
    (key) => key.toLowerCase() === input.toLowerCase(),
  );

  let userGroups: string[];

  if (groupPreset[input]) {
    userGroups = groupPreset[input];
  } else if (userKey) {
    userGroups = [userKey];
  } else {
    userGroups = ["admin"];
  }

  const userDetails = userGroups
    .map((group) => {
      if (group.toLowerCase() === "hmctsadmin") return null; // skip case creator
      const user = config.users[group];
      if (!user) return null;

      const roleKey = Object.keys(userRoleConfig).find(
        (key) => key.toLowerCase() === group.toLowerCase(),
      );
      const role = roleKey ? userRoleConfig[roleKey] : {};

      return {
        username: user.username,
        defendants: role.defendants ?? [],
      };
    })
    .filter(Boolean) as { username: string; defendants: string[] }[];

  // Always include Admin for case deletion
  if (!userDetails.some((u) => u.username === config.users.admin.username)) {
    userDetails.push({ username: config.users.admin.username, defendants: [] });
  }

  return userDetails;
}

/**
 * Creates a new case via the UI, adds defendants, and assigns user access.
 * This is the foundational setup helper used by most E2E tests.
 * Returns the generated case name and URN for use in subsequent steps.
 */

export async function createNewCaseWithDefendantsAndUsers(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  caseName: string,
  caseUrn: string,
  users: string,
  numberDefendants: "One" | "Two" = "Two",
  prosecutedBy?: string,
) {
  let newCaseName: string;
  let newCaseUrn: string;
  if (prosecutedBy) {
    ({ newCaseName, newCaseUrn } = await createCasePage.createNewCase(
      caseName,
      caseUrn,
      prosecutedBy,
    ));
  } else {
    ({ newCaseName, newCaseUrn } = await createCasePage.createNewCase(
      caseName,
      caseUrn,
    ));
  }

  // Add Defendants

  let defDetails: { surName: string; dobMonth: string }[] = [];

  if (numberDefendants === "One") {
    defDetails = [{ surName: "One", dobMonth: "January" }];
  } else {
    defDetails = [
      { surName: "One", dobMonth: "January" },
      { surName: "Two", dobMonth: "February" },
    ];
  }
  for (const defDetail of defDetails) {
    await caseDetailsPage.goToAddDefendant();
    await expect(addDefendantPage.addDefHeading).toHaveText("Add Defendant", {
      timeout: 30000,
    });
    await addDefendantPage.addDefendant(
      defDetail.surName,
      defDetail.dobMonth,
      newCaseUrn,
    );
  }

  // Add Relevant User Access

  await caseDetailsPage.caseNavigation.navigateTo("People");

  const userDetails = getUserDetails(users);

  for (const userDetail of userDetails) {
    await peoplePage.addUser(userDetail.username, userDetail?.defendants);
  }
  await expect(peoplePage.pageTitle).toBeVisible({ timeout: 40_000 });
  return { newCaseName, newCaseUrn };
}

/**
 * Creates a new case with at least one unrestricted document uploaded
 * to a randomly selected unrestricted section.
 *
 * Also records the expected ROCA entries for later verification.
 */
export async function createNewCaseWithUnrestrictedDocument(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  sectionsPage,
  sectionDocumentsPage,
  rocaPage,
  caseName: string,
  caseUrn: string,
  users,
) {
  const { newCaseName, newCaseUrn } = await createNewCaseWithDefendantsAndUsers(
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    peoplePage,
    caseName,
    caseUrn,
    users,
  );
  const uploadedDocuments: ROCAModel[] = [];
  await peoplePage.caseNavigation.navigateTo("Sections");
  const sampleKey = await getRandomSectionKey(
    sectionsPage,
    sections.unrestricted,
  );
  for (const [sectionIndex, sectionKey] of sampleKey) {
    await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
      sectionKey,
      "unrestrictedSectionUpload",
      sectionIndex,
    );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    await rocaPage.createROCAModelRecord(
      uploadedDocuments,
      sectionIndex,
      "unrestrictedSectionUpload",
      "Create",
      config.users.hmctsAdmin.username,
    );
  }

  return { newCaseName, newCaseUrn, sampleKey, uploadedDocuments };
}

/**
 * Creates a new case with at least one restricted document uploaded
 * to a randomly selected restricted section.
 *
 * Document access is scoped to a specific defendant to enable
 * representation-based visibility testing.
 *
 * Also records the expected ROCA entries for later verification.
 */
export async function createNewCaseWithRestrictedDocument(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  sectionsPage,
  sectionDocumentsPage,
  rocaPage,
  caseName: string,
  caseUrn: string,
  users,
) {
  const { newCaseName, newCaseUrn } = await createNewCaseWithDefendantsAndUsers(
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    peoplePage,
    caseName,
    caseUrn,
    users,
  );
  const uploadedDocuments: ROCAModel[] = [];
  await peoplePage.caseNavigation.navigateTo("Sections");
  const sampleKey = await getRandomSectionKey(
    sectionsPage,
    sections.restricted,
  );
  for (const [sectionIndex, key] of sampleKey) {
    await sectionsPage.uploadRestrictedSectionDocument(
      key,
      "restrictedSectionUploadDefendantOne",
      "One, Defendant",
    );
    await rocaPage.createROCAModelRecord(
      uploadedDocuments,
      sectionIndex,
      "restrictedSectionUploadDefendantOne",
      "Create",
      config.users.hmctsAdmin.username,
      "One Defendant",
    );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
  }

  return { newCaseName, newCaseUrn, sampleKey, uploadedDocuments };
}
