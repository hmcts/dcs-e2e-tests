export async function uploadAndValidateRestrictedDocumentUpload(
  user: string,
  entries: [string, string][],
  expectedDocs: { name: string; shouldBeVisible: boolean }[],
  resultsArray: string[],
  sectionsPage,
  sectionDocumentsPage,
  filename?: string,
  defendant?: string
) {
  for (const [section, key] of entries) {
    if (filename) {
      await sectionsPage.uploadRestrictedSectionDocument(
        key,
        filename,
        defendant
      );
    } else {
      await sectionsPage.goToViewDocumentsByKey(key);
    }
    const validationIssues =
      await sectionDocumentsPage.validateRestrictedSectionDocumentUpload(
        section,
        user,
        expectedDocs
      );
    if (validationIssues) resultsArray.push(validationIssues);
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
  }
  await sectionsPage.navigation.navigateTo("LogOff");
}

export async function verifyDocumentMove(
  user,
  section,
  newSection,
  filename,
  sectionDocumentsPage,
  sectionsPage
) {
  await sectionDocumentsPage.page
    .locator("table.formTable-zebra tbody tr:nth-child(n+2)")
    .first()
    .waitFor({ state: "visible", timeout: 20000 });
  const rows = sectionDocumentsPage.page.locator(
    "table.formTable-zebra tbody tr:nth-child(n+3)"
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
    }
  );
  try {
    await movedDocument.waitFor({ state: "visible", timeout: 10000 });
  } catch (error) {
    return `Move: Document not found in new Section: ${section}. Error: ${error}`;
  }
}
