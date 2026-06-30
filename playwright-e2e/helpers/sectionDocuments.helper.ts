import { config, sections, getRandomSectionKey } from "../utils/index.ts";
import { loginAndOpenCase } from "./login.helper.ts";

/**
 * Uploads a restricted document to specified sections and validates its visibility.
 * This helper is used to test role-based access control for restricted documents.
 *
 * @param {string} user - The user role performing the upload and validation.
 * @param {[string, string][]} entries - An array of [sectionName, sectionKey] tuples for document upload.
 * @param {{name: string; shouldBeVisible: boolean}[]} expectedDocs - An array of expected documents and their visibility status.
 * @param {string[]} resultsArray - An array to push validation issues into.
 * @param {object} sectionsPage - The Playwright Page Object for the sections page.
 * @param {object} sectionDocumentsPage - The Playwright Page Object for the section documents page.
 * @param {string} [filename] - The name of the file to upload.
 * @param {string} [defendant] - The defendant associated with the restricted document.
 */
export async function uploadAndValidateRestrictedDocumentUpload(
  user: string,
  entries: [string, string][],
  expectedDocs: { name: string; shouldBeVisible: boolean }[],
  resultsArray: string[],
  sectionsPage,
  sectionDocumentsPage,
  filename?: string,
  defendant?: string,
) {
  for (const [section, key] of entries) {
    if (filename) {
      await sectionsPage.uploadRestrictedSectionDocument(key, filename, [
        defendant,
      ]);
    } else {
      await sectionsPage.goToViewDocumentsByKey(key);
    }
    const validationIssues =
      await sectionDocumentsPage.validateRestrictedSectionDocumentUpload(
        section,
        user,
        expectedDocs,
      );
    if (validationIssues) resultsArray.push(validationIssues);
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
  }
  await sectionsPage.navigation.logOff();
}

/**
 * Verifies that a document has been successfully moved from one section to another.
 * This function checks for the absence of the document in the original section
 * and its presence in the new section.
 */
export async function verifyDocumentMove(
  user,
  section,
  newSection,
  filename,
  sectionDocumentsPage,
  sectionsPage,
) {
  await sectionDocumentsPage.page
    .locator("table.formTable-zebra tbody tr:nth-child(n+2)")
    .first()
    .waitFor({ state: "visible", timeout: 40000 });
  const rows = sectionDocumentsPage.page.locator(
    "table.formTable-zebra tbody tr:nth-child(n+3)",
  );
  const count = await rows.count();
  if (count > 0) {
    return `Move: Document move failed for ${user} in Section ${section}`;
  }
  await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
  await sectionsPage.goToViewDocumentsBySectionLetter(newSection);
  const movedDocument = sectionDocumentsPage.page.locator(
    "td.documentInContentsIndex span",
    {
      hasText: `${filename}`,
    },
  );
  try {
    await movedDocument.waitFor({ state: "visible", timeout: 40000 });
  } catch (error) {
    return `Move: Document not found in new Section: ${section}. Error: ${error}`;
  }
}

/**
 * Helper function to log in a user, navigate to sections, upload a restricted document,
 * capture the document key, and then log off. Returns the section name, section key, and document key.
 */
export async function uploadRestrictedDocument(
  homePage,
  loginPage,
  caseSearchPage,
  caseDetailsPage,
  sectionsPage,
  sectionDocumentsPage,
  user,
  newCaseName: string,
  documentName: string,
  defendantNames: string[],
): Promise<{ sectionName: string; sectionKey: string; documentKey: string }> {
  await loginAndOpenCase(
    homePage,
    loginPage,
    caseSearchPage,
    user,
    newCaseName,
  );
  await caseDetailsPage.caseNavigation.navigateTo("Sections");

  const restrictedSections = sections.restricted;
  const randomSection = await getRandomSectionKey(
    sectionsPage,
    restrictedSections,
  );
  const [sectionName, sectionKey] = randomSection[0];

  await sectionsPage.uploadRestrictedSectionDocument(
    sectionKey,
    documentName,
    defendantNames,
  );

  const documentKey = await sectionDocumentsPage.getDocumentKey();

  return { sectionName, sectionKey, documentKey };
}
