import { test, expect } from "../fixtures";
import { createNewCaseWithDefendantsAndUsers } from "../helpers/createCase.helper";

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
    indexPage
  }) => {

    await caseDetailsPage.caseNavigation.navigateTo('Index')
    const documentList = await indexPage.getIndexDocuments();
    await expect(documentList.length).toBeGreaterThan(0);
  }
)}
)
