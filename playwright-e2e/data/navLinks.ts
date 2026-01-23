import { config } from "../utils";
import { Page, Locator } from "playwright-core";
/**
 * Navigation link models
 * ----------------------
 * This file defines the expected navigation links and destinations that appear
 * throughout the Platform UI.
 *
 * These models are used by E2E tests to validate:
 *  - the presence of navigation links
 *  - correct routing when links are clicked
 *  - page titles and URLs after navigation
 *
 * Links are grouped by context:
 *  - External links (always visible, open outside the platform)
 *  - Internal platform links when logged out
 *  - Internal platform links when logged in
 *  - Case-level navigation links (require a case to be open)
 *
 * URLs are intentionally defined as partial matches in some cases where:
 *  - query parameters are dynamic (e.g. caseKey)
 */

/**
 * Represents a standard navigation link with a name, expected page title, and URL.
 */

export interface NavLink {
  name: string;
  expectedTitle: string;
  expectedUrl: string;
}

/**
 * Represents a navigation link within a case, with a name, URL, mode (to account for
 * popups) and a page identifier.
 */
export type CaseLinkMode = "same-page" | "popup";

export interface CaseLink {
  name: string;
  expectedUrl: string;
  pageIdentifier: (page: Page) => Locator;
  mode: CaseLinkMode;
}

export const externalLinks: NavLink[] = [
  {
    name: "Accessibility",
    expectedTitle: "CCDCS",
    expectedUrl: "https://www.gov.uk/help/accessibility-statement",
  },
  {
    name: "Guidance",
    expectedTitle: "CCDCS",
    expectedUrl:
      "https://www.gov.uk/guidance/crown-court-digital-case-system-guidance",
  },
];

export const publicNavigationLinks: NavLink[] = [
  {
    name: "Home",
    expectedTitle: "CCDCS",
    expectedUrl: `${config.urls.base}`,
  },
  {
    name: "LogOn",
    expectedTitle: "Log On",
    expectedUrl: `${config.urls.base}Account/logon`, //partial lowercase match due to two possible urls /Logon and /logon?IsSecure=yes
  },
  {
    name: "Register",
    expectedTitle: "Register",
    expectedUrl: `${config.urls.base}Account/Register`,
  },
  {
    name: "ContactUs",
    expectedTitle: "ContactUs",
    expectedUrl: `${config.urls.base}Home/ContactUs`,
  },
];

export const authenticatedNavigationLinks: NavLink[] = [
  {
    name: "AccountDetails",
    expectedTitle: "My Details",
    expectedUrl: `${config.urls.base}Person/Details?personKey=`,
  },
  {
    name: "ViewCaseListLink",
    expectedTitle: "Case List",
    expectedUrl: `${config.urls.base}Case/CaseIndex`,
  },
  {
    name: "ApprovalRequests",
    expectedTitle: "Approval Requests",
    expectedUrl: `${config.urls.base}Home/ApprovalRequest`,
  },
  {
    name: "Admin",
    expectedTitle: "Case List",
    expectedUrl: `${config.urls.base}Admin`,
  },
  {
    name: "LogOff",
    expectedTitle: "CCDCS",
    expectedUrl: `${config.urls.base}`,
  },
];

export const caseLinks: CaseLink[] = [
  {
    name: "CaseHome",
    expectedUrl: `${config.urls.base}Case/Details`,
    pageIdentifier: (page: Page) =>
      page.locator(".heading-small", { hasText: "Case Details" }),
    mode: "same-page",
  },
  {
    name: "Review",
    expectedUrl: `${config.urls.base}Case/Review3/`,
    pageIdentifier: (page: Page) =>
      page.locator("#rmiAnnotations", { hasText: " Notes" }),
    mode: "popup",
  },
  {
    name: "Index",
    expectedUrl: `${config.urls.base}Case/FullIndex`,
    pageIdentifier: (page: Page) => page.locator("h3", { hasText: " Content" }),
    mode: "same-page",
  },
  {
    name: "Sections",
    expectedUrl: `${config.urls.base}Section`,
    pageIdentifier: (page: Page) =>
      page.locator("h3", { hasText: " Sections" }),
    mode: "same-page",
  },
  {
    name: "People",
    expectedUrl: `${config.urls.base}Person`,
    pageIdentifier: (page: Page) =>
      page.locator("h3", { hasText: "People Index" }),
    mode: "same-page",
  },
  {
    name: "Access",
    expectedUrl: `${config.urls.base}CaseAccess/Index`,
    pageIdentifier: (page: Page) =>
      page.locator(".heading-medium", { hasText: "Case Access" }),
    mode: "same-page",
  },
  {
    name: "Bundle",
    expectedUrl: `${config.urls.base}Case/CompleteBundle`,
    pageIdentifier: (page: Page) =>
      page.locator("h3", { hasText: "Case Bundle" }),
    mode: "same-page",
  },
  {
    name: "Search",
    expectedUrl: `${config.urls.base}Case/Search`,
    pageIdentifier: (page: Page) => page.locator("h3", { hasText: " Search" }),
    mode: "same-page",
  },
  {
    name: "Memos",
    expectedUrl: `${config.urls.base}Comment/Create`,
    pageIdentifier: (page: Page) =>
      page.locator("h3", { hasText: " Add a Memorandum" }),
    mode: "same-page",
  },
  {
    name: "Notes",
    expectedUrl: `${config.urls.base}Case/Notes`,
    pageIdentifier: (page: Page) =>
      page.locator(".heading-medium", { hasText: " View Notes" }),
    mode: "same-page",
  },
  {
    name: "Hyperlinks",
    expectedUrl: `${config.urls.base}Case/Hyperlinks`,
    pageIdentifier: (page: Page) =>
      page.locator("h2", { hasText: " View Hyperlinks" }),
    mode: "same-page",
  },
  {
    name: "Ingest",
    expectedUrl: `${config.urls.base}Case/UpdateCaseFromFile`,
    pageIdentifier: (page: Page) =>
      page.locator("legend", { hasText: "Ingest Composite File" }),
    mode: "same-page",
  },
  {
    name: "LinkedCases",
    expectedUrl: `${config.urls.base}Case/CaseGroup`,
    pageIdentifier: (page: Page) =>
      page.locator("h3", { hasText: " Linked Cases" }),
    mode: "same-page",
  },
  {
    name: "ShownToJury",
    expectedUrl: `${config.urls.base}Case/ShownToJury`,
    pageIdentifier: (page: Page) =>
      page.locator("h2", { hasText: " Pages Shown to the Jury" }),
    mode: "same-page",
  },
  {
    name: "ROCA",
    expectedUrl: `${config.urls.base}Case/Roca`,
    pageIdentifier: (page: Page) =>
      page.locator("h2", { hasText: "Record of Case Activity" }),
    mode: "same-page",
  },
  {
    name: "LAA",
    expectedUrl: `${config.urls.base}Case/LegalAidAgency`,
    pageIdentifier: (page: Page) =>
      page.locator("h2", { hasText: "LAA Report" }),
    mode: "same-page",
  },
  {
    name: "PTPH",
    expectedUrl: `${config.urls.base}OnlineForms/Index2`,
    pageIdentifier: (page: Page) =>
      page.locator("h1", { hasText: "Plea & Trial Preparation Hearing Form" }),
    mode: "same-page",
  },
  {
    name: "Indictment",
    expectedUrl: `${config.urls.base}Case/Indictment`,
    pageIdentifier: (page: Page) =>
      page.locator(".heading-medium", { hasText: "Message" }),
    mode: "same-page",
  },
  {
    name: "Split",
    expectedUrl: `${config.urls.base}Case/Split`,
    pageIdentifier: (page: Page) =>
      page.locator(".heading-small", { hasText: "Split Cases" }),
    mode: "same-page",
  },
  {
    name: "Merge",
    expectedUrl: `${config.urls.base}Case/Merge`,
    pageIdentifier: (page: Page) =>
      page.locator(".heading-small", { hasText: "Merge Cases" }),
    mode: "same-page",
  },
];
