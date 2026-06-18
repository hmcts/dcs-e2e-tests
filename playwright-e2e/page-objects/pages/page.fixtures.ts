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
import HomePage from "./platform/home.page.ts";
import CaseSearchPage from "./case/caseSearch.page.ts";
import CaseDetailsPage from "./case/caseDetails.page.ts";
import LoginPage from "./platform/login.page.ts";
import ReviewEvidencePage from "./case/reviewEvidence/reviewEvidence.page.ts";
import UpdateFrontPage from "./case/updateFront.page.ts";
import CreateCasePage from "./case/createCase.page.ts";
import AddDefendantPage from "./case/addDefendant.page.ts";
import ChangeCaseDetailsPage from "./case/changeCaseDetails.page.ts";
import SectionsPage from "./case/sections.page.ts";
import SectionDocumentsPage from "./case/sectionDocuments.page.ts";
import ViewDocumentPage from "./case/viewDocument.page.ts";
import UploadDocumentPage from "./case/uploadDocument.page.ts";
import PeoplePage from "./case/people.page.ts";
import MemoPage from "./case/memo.page.ts";
import IngestPage from "./case/ingest.page.ts";
import ROCAPage from "./case/ROCA.page.ts";
import RegisterUserPage from "./platform/register/registerUser.page.ts";
import AdminPage from "./platform/admin.page.ts";
import UserSettingsPage from "./platform/register/userSettings.page.ts";
import ApprovalRequestsPage from "./platform/register/approvalRequests.page.ts";
import ApproveAccessRequestPage from "./platform/register/approveAccessRequest.page.ts";
import RejectAccessRequestPage from "./platform/register/rejectAccessRequest.page.ts";
import CreateNewSectionPage from "./case/createNewSection.page.ts";
import SplitCasePage from "./case/splitCase.page.ts";
import MergeCasePage from "./case/mergeCase.page.ts";
import UpdateDocumentsPage from "./case/updateDocuments.page.ts";
import IndexPage from "./case/index.page.ts";
import PTPHPage from "./case/ptph.page.ts";
import AccessPage from "./case/access.page.ts";
import AddEmailDomainPage from "./case/addEmailDomain.page.ts";
import EditHearingDatePage from "./case/editHearingDate.page.ts";
import EmailVerificationRequiredPage from "./platform/register/emailVerificationRequired.page.ts";

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
  accessPage: AccessPage;
  addEmailDomainPage: AddEmailDomainPage;
  editHearingDatePage: EditHearingDatePage;
  emailVerificationRequiredPage: EmailVerificationRequiredPage;
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
  accessPage: async ({ page }, use) => {
    await use(new AccessPage(page));
  },
  addEmailDomainPage: async ({ page }, use) => {
    await use(new AddEmailDomainPage(page));
  },
  editHearingDatePage: async ({ page }, use) => {
    await use(new EditHearingDatePage(page));
  },
  emailVerificationRequiredPage: async ({ page }, use) => {
    await use(new EmailVerificationRequiredPage(page));
  },
};
