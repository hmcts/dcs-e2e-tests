import HomePage from "./home.page";
import CaseSearchPage from "./caseSearch.page";
import CaseDetailsPage from "./caseDetails.page";
import LoginPage from "./login.page";
import ReviewEvidencePage from "./reviewEvidence.page";
import UpdateFrontPage from "./updateFront.page";
import CreateCasePage from "./createCase.page";
import AddDefendantPage from "./addDefendant.page";
import ChangeCaseDetailsPage from "./changeCaseDetails.page";
import SectionsPage from "./sections.page";
import SectionDocumentsPage from "./sectionDocuments.page";
import ViewDocumentPage from "./viewDocument.page";
import MemoPage from "./memo.page";
import RegisterUserPage from "./registerUser.page";
import AdminPage from "./admin.page";
import UserSettingsPage from "./userSettings.page";
import ApprovalRequestsPage from "./approvalRequests.page";
import ApproveAccessRequestPage from "./approveAccessRequest.page";
import RejectAccessRequestPage from "./rejectAccessRequest.page";


export interface PageFixtures {
  homePage: HomePage;
  caseSearchPage: CaseSearchPage;
  caseDetailsPage: CaseDetailsPage;
  loginPage: LoginPage;
  reviewEvidencePage: ReviewEvidencePage;
  updateFrontPage: UpdateFrontPage;
  createCasePage: CreateCasePage;
  addDefendantPage: AddDefendantPage;
  changeCaseDetailsPage: ChangeCaseDetailsPage;
  memoPage: MemoPage;
  sectionsPage: SectionsPage;
  viewDocumentPage: ViewDocumentPage;
  sectionDocumentsPage: SectionDocumentsPage;
  registerUserPage: RegisterUserPage;
  adminPage: AdminPage;
  userSettingsPage: UserSettingsPage;
  approvalRequestsPage: ApprovalRequestsPage;
  approveAccessRequestPage: ApproveAccessRequestPage;
  rejectAccessRequestPage: RejectAccessRequestPage;
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
  createCasePage: async ({ page }, use) => {
    await use(new CreateCasePage(page));
  },
  addDefendantPage: async ({ page }, use) => {
    await use(new AddDefendantPage(page));
  },
  changeCaseDetailsPage: async ({ page }, use) => {
    await use(new ChangeCaseDetailsPage(page));
  },
  memoPage: async ({ page }, use) => {
    await use(new MemoPage(page));
  },
  sectionsPage: async ({ page }, use) => {
    await use(new SectionsPage(page));
  },
  viewDocumentPage: async ({ page }, use) => {
    await use(new ViewDocumentPage(page));
  },
  sectionDocumentsPage: async ({ page }, use) => {
    await use(new SectionDocumentsPage(page));
  },
  registerUserPage: async ({ page }, use) => {
    await use(new RegisterUserPage(page));
  },
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  userSettingsPage: async ({ page }, use) => {
    await use(new UserSettingsPage(page));
  },
  approvalRequestsPage: async ({ page }, use) => {
    await use(new ApprovalRequestsPage(page));
  },
  approveAccessRequestPage: async ({ page }, use) => {
    await use(new ApproveAccessRequestPage(page));
  },
  rejectAccessRequestPage: async ({ page }, use) => {
    await use(new RejectAccessRequestPage(page));
  },
};
