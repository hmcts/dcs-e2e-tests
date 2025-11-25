import { test, expect } from "../fixtures";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { sections, config } from "../utils";

test.describe("Index Page Functionality", () => {
  let newCaseName: string;

test.beforeEach(
    async ({
      homePage,
      caseSearchPage,
      caseDetailsPage,
      createCasePage,
      addDefendantPage,
      peoplePage
    }) => {
      await homePage.open();
      await homePage.navigation.navigateTo("ViewCaseListLink");
      await caseSearchPage.goToCreateCase();

      // Create Case with Defendants and Defence Users
      const newCase = await createNewCaseWithDefendantsAndUsers(
        createCasePage,
        caseDetailsPage,
        addDefendantPage,
        peoplePage,
        "TestCase",
        "TestURN"
      );
      newCaseName = newCase.newCaseName;
    }
  );

test(`Get Sections & Documents from Index Page`, async ({
    caseDetailsPage,
    indexPage,
    sectionDocumentsPage,
    sectionsPage
  }) => {

    await caseDetailsPage.caseNavigation.navigateTo("Sections"); 
    const unrestrictedSections = sections.unrestricted;
    const unrestrictedSectionKeys = await sectionsPage.getSectionKeys(
          unrestrictedSections
    );
    const sampleEntries = Object.entries(unrestrictedSectionKeys)
          .sort(() => Math.random() - 0.5)
          .slice(0, 1);
    
    for (const [section, key] of sampleEntries) {
            await sectionsPage.uploadAndValidateUnrestrictedSectionDocument(
              key,
              "unrestrictedSectionUpload",
              section
    );
    await sectionDocumentsPage.caseNavigation.navigateTo("Sections");
    await caseDetailsPage.caseNavigation.navigateTo('Index')
    const documentList = await indexPage.getIndexDocuments();
    await expect(documentList.length).toBeGreaterThan(0);
  }}
)}
)
