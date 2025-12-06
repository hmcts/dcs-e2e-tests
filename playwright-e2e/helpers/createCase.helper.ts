import { config } from "../utils";
import { expect } from "../fixtures";
import { sections } from "../utils";
import { ROCAModel } from "../data/ROCAModel";
import { getRandomSectionKey } from "../utils";

export async function createNewCaseWithDefendantsAndUsers(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  caseName: string,
  caseUrn: string,
  users: string
) {
  const { newCaseName, newCaseUrn } =
    await createCasePage.generateCaseNameAndUrn(caseName, caseUrn);
  await createCasePage.caseName.fill(newCaseName.toString());
  await createCasePage.caseUrn.fill(newCaseUrn.toString());
  const prosecutorLabel = await createCasePage.selectRandomOptionFromDropdown(
    createCasePage.dropdownCaseProsecutedBy
  );
  await createCasePage.dropdownCaseProsecutedBy.selectOption(prosecutorLabel);
  await createCasePage.dropdownCourtHouse.selectOption({ label: "Southwark" });
  const today = new Date();
  const date = today.getDate();
  const monthName = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  await createCasePage.hearingDateDay.selectOption({ label: date.toString() });
  await createCasePage.hearingDateMonth.selectOption({
    label: monthName.toString(),
  });
  await createCasePage.hearingDateYear.selectOption({ label: year.toString() });
  await createCasePage.submitCreateBtn.click();

  // Add Defendants
  const defendantDetails = [
    { surName: "One", dobMonth: "January" },
    { surName: "Two", dobMonth: "February" },
  ];
  for (const defDetail of defendantDetails) {
    await caseDetailsPage.goToAddDefendant();
    await addDefendantPage.addDefendant(
      defDetail.surName,
      defDetail.dobMonth,
      newCaseUrn
    );
  }
  // Add Relevant Users
  await caseDetailsPage.caseNavigation.navigateTo("People");

  let userDetails: { username: string; defendants?: string[] }[] = [];

  if (users === "Defence") {
    userDetails = [
      {
        username: config.users.defenceAdvocateA.username,
        defendants: ["Defendant One"],
      },
      {
        username: config.users.defenceAdvocateB.username,
        defendants: ["Defendant Two"],
      },
      {
        username: config.users.defenceAdvocateC.username,
        defendants: ["Defendant One", "Defendant Two"],
      },
      { username: config.users.admin.username },
    ];
  } else if (users === "Complete") {
    userDetails = [
      {
        username: config.users.defenceAdvocateA.username,
        defendants: ["Defendant One"],
      },
      {
        username: config.users.defenceAdvocateB.username,
        defendants: ["Defendant Two"],
      },
      {
        username: config.users.defenceAdvocateC.username,
        defendants: ["Defendant One", "Defendant Two"],
      },
      { username: config.users.admin.username },
      { username: config.users.probationStaff.username },
      { username: config.users.fullTimeJudge.username },
      { username: config.users.cpsAdmin.username },
      { username: config.users.cpsProsecutor.username },
    ];
  }

  for (const defenceDetail of userDetails) {
    await peoplePage.addUser(defenceDetail.username, defenceDetail?.defendants);
  }
  await expect(peoplePage.pageTitle).toBeVisible({ timeout: 20_000 });
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