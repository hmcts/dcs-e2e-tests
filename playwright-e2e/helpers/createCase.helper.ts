import { config } from "../utils";
import { expect } from "../fixtures";
import { sections } from "../utils";
import { ROCAModel } from "../data/ROCAModel";
import { getRandomSectionKey } from "../utils";

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

const groupPreset = {
  Defence: [
    "defenceAdvocateA",
    "defenceAdvocateB",
    "defenceAdvocateC",
    "admin",
  ],
};

export function getUserDetails(input: string) {
  // Find key in config.users ignoring case
  const userKey = Object.keys(config.users).find(
    (key) => key.toLowerCase() === input.toLowerCase()
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
        (key) => key.toLowerCase() === group.toLowerCase()
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

export async function createNewCaseWithDefendantsAndUsers(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  caseName: string,
  caseUrn: string,
  users: string,
  numberDefendants: string = "Two",
  prosecutedBy?: string
) {
  let newCaseName: string;
  let newCaseUrn: string;
  if (prosecutedBy) {
    ({ newCaseName, newCaseUrn } = await createCasePage.createNewCase(
      caseName,
      caseUrn,
      prosecutedBy
    ));
  } else {
    ({ newCaseName, newCaseUrn } = await createCasePage.createNewCase(
      caseName,
      caseUrn
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
    await expect(addDefendantPage.addDefHeading).toHaveText("Add Defendant");
    await addDefendantPage.addDefendant(
      defDetail.surName,
      defDetail.dobMonth,
      newCaseUrn
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
  users
) {
  const { newCaseName, newCaseUrn } = await createNewCaseWithDefendantsAndUsers(
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    peoplePage,
    caseName,
    caseUrn,
    users
  );
  const uploadedDocuments: ROCAModel[] = [];
  await peoplePage.caseNavigation.navigateTo("Sections");
  const sampleKey = await getRandomSectionKey(
    sectionsPage,
    sections.unrestricted
  );
  for (const [sectionIndex, sectionKey] of sampleKey) {
    await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
      sectionKey,
      "unrestrictedSectionUpload",
      sectionIndex
    );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    await rocaPage.createROCAModelRecord(
      uploadedDocuments,
      sectionIndex,
      "unrestrictedSectionUpload",
      "Create",
      config.users.hmctsAdmin.username
    );
  }

  return { newCaseName, newCaseUrn, sampleKey, uploadedDocuments };
}

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
  users
) {
  const { newCaseName, newCaseUrn } = await createNewCaseWithDefendantsAndUsers(
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    peoplePage,
    caseName,
    caseUrn,
    users
  );
  const uploadedDocuments: ROCAModel[] = [];
  await peoplePage.caseNavigation.navigateTo("Sections");
  const sampleKey = await getRandomSectionKey(
    sectionsPage,
    sections.restricted
  );
  for (const [sectionIndex, key] of sampleKey) {
    await sectionsPage.uploadRestrictedSectionDocument(
      key,
      "restrictedSectionUploadDefendantOne",
      "One, Defendant"
    );
    await rocaPage.createROCAModelRecord(
      uploadedDocuments,
      sectionIndex,
      "restrictedSectionUploadDefendantOne",
      "Create",
      config.users.hmctsAdmin.username,
      "One Defendant"
    );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
  }

  return { newCaseName, newCaseUrn, sampleKey, uploadedDocuments };
}
