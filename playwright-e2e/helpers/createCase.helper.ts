import { config } from "../utils";
import { expect } from "../fixtures";
import { sections } from "../utils";

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
  const label = await createCasePage.selectRandomOptionFromDropdown(
    createCasePage.dropdownCaseProsecutedBy
  );
  await createCasePage.dropdownCaseProsecutedBy.selectOption({ label });
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
  const unrestrictedSections = sections.unrestricted;
  const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
    unrestrictedSections
  );
  const sampleKeys = Object.entries(unrestrictedSectionKeys)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

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
  const restrictedSections = sections.restricted;
  const restrictedSectionKeys = await sectionsPage.getSectionKeys(
    restrictedSections
  );
  const sampleKeys = Object.entries(restrictedSectionKeys)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

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
