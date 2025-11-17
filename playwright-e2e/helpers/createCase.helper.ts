import { config } from "../utils";
import { expect } from "../fixtures";
import { sections } from "../utils";
import { ROCAModel } from "../data/ROCAModel";
import { getRandomSectionKeys } from "../utils";

export async function createNewCaseWithDefendantsAndUsers(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  caseName: string,
  caseUrn: string
) {
  const { newCaseName, newCaseUrn } =
    await createCasePage.generateCaseNameAndUrn(caseName, caseUrn);
  await createCasePage.caseName.fill(newCaseName.toString());
  await createCasePage.caseUrn.fill(newCaseUrn.toString());
  const prosecutorLabel = await createCasePage.selectRandomOptionFromDropdown(
    createCasePage.dropdownCaseProsecutedBy
  );
  await createCasePage.dropdownCaseProsecutedBy.selectOption({
    prosecutorLabel,
  });
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
  // Add Defence Lawyers for Defendants
  await caseDetailsPage.caseNavigation.navigateTo("People");
  const defenceUserDetails = [
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
  for (const defenceDetail of defenceUserDetails) {
    await peoplePage.addUser(defenceDetail.username, defenceDetail?.defendants);
  }
  await expect(peoplePage.pageTitle).toBeVisible({ timeout: 20_000 });
  await peoplePage.caseNavigation.navigateTo("Sections");
  return { newCaseName, newCaseUrn };
}

export async function createNewCaseWithUnrestrictedDocuments(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  sectionsPage,
  sectionDocumentsPage,
  caseName: string,
  caseUrn: string
) {
  const { newCaseName, newCaseUrn } = await createNewCaseWithDefendantsAndUsers(
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    peoplePage,
    caseName,
    caseUrn
  );
  const sampleKeys = await getRandomSectionKeys(
    sectionsPage,
    sections.unrestricted
  );

  for (const [section, key] of sampleKeys) {
    await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
      key,
      "unrestrictedSectionUpload",
      section
    );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
  }

  return { newCaseName, newCaseUrn, sampleKeys };
}

export async function createNewCaseWithRestrictedDocuments(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  sectionsPage,
  sectionDocumentsPage,
  caseName: string,
  caseUrn: string
) {
  const { newCaseName, newCaseUrn } = await createNewCaseWithDefendantsAndUsers(
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    peoplePage,
    caseName,
    caseUrn
  );
  const sampleKeys = await getRandomSectionKeys(
    sectionsPage,
    sections.restricted
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [section, key] of sampleKeys) {
    await sectionsPage.uploadRestrictedSectionDocument(
      key,
      "restrictedSectionUploadDefendantOne",
      "One, Defendant"
    );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
  }

  return { newCaseName, newCaseUrn, sampleKeys };
}

export async function createNewCaseWithUnrestrictedDocumentsROCA(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  sectionsPage,
  sectionDocumentsPage,
  rocaPage,
  caseName: string,
  caseUrn: string
) {
  const { newCaseName, newCaseUrn } = await createNewCaseWithDefendantsAndUsers(
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    peoplePage,
    caseName,
    caseUrn
  );
  const uploadedDocuments: ROCAModel[] = [];
  const sampleKeys = await getRandomSectionKeys(
    sectionsPage,
    sections.unrestricted
  );

  for (const [sectionIndex, sectionKey] of sampleKeys) {
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

  return { newCaseName, newCaseUrn, sampleKeys, uploadedDocuments };
}

export async function createNewCaseWithRestrictedDocumentsROCA(
  createCasePage,
  caseDetailsPage,
  addDefendantPage,
  peoplePage,
  sectionsPage,
  sectionDocumentsPage,
  rocaPage,
  caseName: string,
  caseUrn: string
) {
  const { newCaseName, newCaseUrn } = await createNewCaseWithDefendantsAndUsers(
    createCasePage,
    caseDetailsPage,
    addDefendantPage,
    peoplePage,
    caseName,
    caseUrn
  );
  const uploadedDocuments: ROCAModel[] = [];
  const sampleKeys = await getRandomSectionKeys(
    sectionsPage,
    sections.restricted
  );

  for (const [sectionIndex, key] of sampleKeys) {
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

  return { newCaseName, newCaseUrn, sampleKeys, uploadedDocuments };
}
