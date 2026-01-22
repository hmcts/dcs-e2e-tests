/**
 * Playwright Page Object Fixtures
 * -------------------------------
 * This file defines Playwright fixtures for all Page Objects in the E2E test suite.
 * These fixtures provide instantiated instances of Page Objects to individual tests,
 * promoting reusability and simplifying test setup.
 *
 * Each fixture is a function that receives a Playwright `page` object and
 * returns an instance of a specific Page Object. This allows tests to
 * access page-specific elements and methods without manual re-instantiation.
 */
import HomePage from "./home.page";
import CaseSearchPage from "./caseSearch.page";
import CaseDetailsPage from "./caseDetails.page";
import LoginPage from "./login.page";
import ReviewEvidencePage from "./Review Evidence/reviewEvidence.page";
import UpdateFrontPage from "./updateFront.page";
import CreateCasePage from "./createCase.page";
import AddDefendantPage from "./addDefendant.page";
import ChangeCaseDetailsPage from "./changeCaseDetails.page";
import SectionsPage from "./sections.page";
import SectionDocumentsPage from "./sectionDocuments.page";
import ViewDocumentPage from "./viewDocument.page";
import UploadDocumentPage from "./uploadDocument.page";
import PeoplePage from "./people.page";
import MemoPage from "./memo.page";
import IngestPage from "./ingest.page";
import ROCAPage from "./ROCA.page";
import RegisterUserPage from "./registerUser.page";
import AdminPage from "./admin.page";
import UserSettingsPage from "./userSettings.page";
import ApprovalRequestsPage from "./approvalRequests.page";
import ApproveAccessRequestPage from "./approveAccessRequest.page";
import RejectAccessRequestPage from "./rejectAccessRequest.page";
import CreateNewSectionPage from "./createNewSection.page"
import SplitCasePage from "./splitCase.page";
import MergeCasePage from "./mergeCase.page";
import UpdateDocumentsPage from "./updateDocuments.page";
import IndexPage from "./index.page";
import PTPHPage from "./ptph.page";

/**
 * Interface defining the types of all available Page Object fixtures.
 * Each property corresponds to an instantiated Page Object class, making
 * them type-safe and easily discoverable in tests.
 */
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
  uploadDocumentPage: UploadDocumentPage;
  peoplePage: PeoplePage;
  ingestPage: IngestPage;
  rocaPage: ROCAPage;
  registerUserPage: RegisterUserPage;
  adminPage: AdminPage;
  userSettingsPage: UserSettingsPage;
  approvalRequestsPage: ApprovalRequestsPage;
  approveAccessRequestPage: ApproveAccessRequestPage;
  rejectAccessRequestPage: RejectAccessRequestPage;
  createNewSectionPage: CreateNewSectionPage;
  splitCasePage: SplitCasePage;
  mergeCasePage: MergeCasePage;
  updateDocumentsPage: UpdateDocumentsPage;
  indexPage: IndexPage;
  ptphPage: PTPHPage;
}

/**
 * Playwright fixtures for Page Objects.
 * Each fixture provides an instance of a Page Object, making it available
 * to tests without manual instantiation. The `use` function passes the
 * instantiated page object to the test function.
 */
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
  createNewSectionPage: async ({ page }, use) => {
    await use(new CreateNewSectionPage(page));
  },
  viewDocumentPage: async ({ page }, use) => {
    await use(new ViewDocumentPage(page));
  },
  sectionDocumentsPage: async ({ page }, use) => {
    await use(new SectionDocumentsPage(page));
  },
  uploadDocumentPage: async ({ page }, use) => {
    await use(new UploadDocumentPage(page));
  },
  peoplePage: async ({ page }, use) => {
    await use(new PeoplePage(page));
  },
  ingestPage: async ({ page }, use) => {
    await use(new IngestPage(page));
  },
  rocaPage: async ({ page }, use) => {
    await use(new ROCAPage(page));
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
  splitCasePage: async ({ page }, use) => {
    await use(new SplitCasePage(page));
  },
  mergeCasePage: async ({ page }, use) => {
    await use(new MergeCasePage(page));
  },
  updateDocumentsPage: async ({ page }, use) => {
    await use(new UpdateDocumentsPage(page));
  },
  indexPage: async ({ page }, use) => {
    await use(new IndexPage(page));
  },
  ptphPage: async ({ page }, use) => {
    await use(new PTPHPage(page));
  },
};
