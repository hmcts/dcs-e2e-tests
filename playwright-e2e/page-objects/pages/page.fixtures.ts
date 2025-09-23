import HomePage from "./home.page";
import CaseListPage from "./caseList.page";
import CaseDetailsPage from "./caseDetails.page";
import LoginPage from "./login.page";
import ReviewEvidencePage from "./reviewEvidence.page";
import UpdateFrontPage from "./updateFront.page";

export interface PageFixtures {
  homePage: HomePage;
  caseListPage: CaseListPage;
  caseDetailsPage: CaseDetailsPage;
  loginPage: LoginPage;
  reviewEvidencePage: ReviewEvidencePage;
  updateFrontPage: UpdateFrontPage;
}

export const pageFixtures = {
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  caseListPage: async ({ page }, use) => {
    await use(new CaseListPage(page));
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
};
