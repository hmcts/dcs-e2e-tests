import { test, expect } from "../fixtures";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";
import { sections } from "../utils";
import { deleteCaseByName } from "../helpers/deleteCase.helper";

test.describe("Index Page Functionality", () => {
  let newCaseName:string;

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
        "TestURN",
        "Defence"
      );
      newCaseName = newCase.newCaseName;
    }
  );

test(`Retrieve & Validate Sections & Documents from Index Page`, async ({
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

    await caseDetailsPage.caseNavigation.navigateTo('Index')
    for (const [section, key] of sampleEntries) {
      await indexPage.goToIndexSectionLink(key, section)
      await indexPage.uploadDocumentFromIndex("unrestrictedSectionUpload");
      await caseDetailsPage.caseNavigation.navigateTo('Index')
      const documentList = await indexPage.getIndexDocuments();
      await expect(documentList.length).toBeGreaterThan(0); 
      const validationResult = await sectionDocumentsPage.validateUnrestrictedSectionDocument("unrestrictedSectionUpload", section);
      await expect(validationResult).toBeUndefined();
    } 
})

test.afterEach(
    async ({ page, caseSearchPage, caseDetailsPage, homePage, loginPage }) => {
      if (newCaseName) {
        await deleteCaseByName(
          newCaseName,
          caseSearchPage,
          caseDetailsPage,
          homePage,
          loginPage,
          page
        );
      }
    }
  );
});

