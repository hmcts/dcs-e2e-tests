export async function uploadAndValidateRestrictedDocumentUpload(
  user: string,
  entries: [string, string][],
  expectedDocs: { name: string; shouldBeVisible: boolean }[],
  resultsArray: { user: string; issues: string[] }[],
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
    if (validationIssues)
      resultsArray.push({
        user: user,
        issues: [validationIssues],
      });
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
  }
  await sectionsPage.navigation.navigateTo("LogOff");
}
