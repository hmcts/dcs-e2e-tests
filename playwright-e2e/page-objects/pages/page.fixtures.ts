import HomePage from "./home.page";
import CaseSearchPage from "./caseSearch.page";
import CaseDetailsPage from "./caseDetails.page";
import LoginPage from "./login.page";
import ReviewEvidencePage from "./reviewEvidence.page";
import UpdateFrontPage from "./updateFront.page";
import NotesPage from "./notes.page";

export interface PageFixtures {
  homePage: HomePage;
  caseSearchPage: CaseSearchPage;
  caseDetailsPage: CaseDetailsPage;
  loginPage: LoginPage;
  reviewEvidencePage: ReviewEvidencePage;
  updateFrontPage: UpdateFrontPage;
  notesPage: NotesPage;
}

export const pageFixtures = {
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  caseSearchPage: async ({ page }, use) => {
    await use(new CaseSearchPage(page));
  },

  caseDetailsPage: async ({ page }, use) => {
    await use(new CaseDetailsPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  reviewEvidencePage: async ({ page }, use) => {
    await use(new ReviewEvidencePage(page));
  },

  updateFrontPage: async ({ page }, use) => {
    await use(new UpdateFrontPage(page));
  },
  notesPage: async ({ page }, use) => {
    await use(new NotesPage(page));
  },
};
