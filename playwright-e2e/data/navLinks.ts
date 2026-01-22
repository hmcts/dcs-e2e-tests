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

import { config } from "../utils";

/**
 * Represents a standard navigation link with a name, expected title, and URL.
 */
export interface NavLink {
  /** The name of the link, used to locate it in the UI. */
  name: string;
  /** The expected page title after clicking the link. */
  expectedTitle: string;
  /** The expected URL (can be a partial match). */
  expectedUrl: string;
}

/**
 * Represents a navigation link within a case, with a name and URL.
 */
export interface CaseLink {
  /** The name of the link, used to locate it in the UI. */
  name: string;
  /** The expected URL (can be a partial match). */
  expectedUrl: string;
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

export const internalLinksLoggedOut: NavLink[] = [
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

export const internalLinksLoggedIn: NavLink[] = [
  {
    name: "AccountDetails",
    expectedTitle: "My Details",
    expectedUrl: `${config.urls.base}Person/Details?personKey=`,
  },
  {
    name: "LogOff",
    expectedTitle: "CCDCS",
    expectedUrl: `${config.urls.base}`,
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
    expectedTitle: "Administration Options",
    expectedUrl: `${config.urls.base}Admin`,
  },
];

export const caseLinks: CaseLink[] = [
  {
    name: "CaseHome",
    expectedUrl: `${config.urls.base}Case/Details?caseKey=`,
  },
  {
    name: "Review",
    expectedUrl: `${config.urls.base}Case/Review3/`,
  },
  {
    name: "Index",
    expectedUrl: `${config.urls.base}Case/FullIndex?caseKey=`,
  },
  {
    name: "Sections",
    expectedUrl: `${config.urls.base}Section?caseKey=`,
  },
  {
    name: "People",
    expectedUrl: `${config.urls.base}Person?caseKey=`,
  },
  {
    name: "Access",
    expectedUrl: `${config.urls.base}CaseAccess/Index/`,
  },
  {
    name: "Bundle",
    expectedUrl: `${config.urls.base}Case/CompleteBundle?caseKey=`,
  },
  {
    name: "Search",
    expectedUrl: `${config.urls.base}Case/Search?caseKey=`,
  },
  {
    name: "Memos",
    expectedUrl: `${config.urls.base}Comment/Create?caseKey=`,
  },
  {
    name: "Notes",
    expectedUrl: `${config.urls.base}Case/Notes?caseKey=`,
  },
  {
    name: "Hyperlinks",
    expectedUrl: `${config.urls.base}Case/Hyperlinks?caseKey=`,
  },
  {
    name: "Ingest",
    expectedUrl: `${config.urls.base}Case/UpdateCaseFromFile/`,
  },
  {
    name: "LinkedCases",
    expectedUrl: `${config.urls.base}Case/CaseGroup/`,
  },
  {
    name: "ShownToJury",
    expectedUrl: `${config.urls.base}Case/ShownToJury/`,
  },
  {
    name: "ROCA",
    expectedUrl: `${config.urls.base}Case/Roca/`,
  },
  {
    name: "LAA",
    expectedUrl: `${config.urls.base}Case/LegalAidAgency/`,
  },
  {
    name: "PTPH",
    expectedUrl: `${config.urls.base}OnlineForms/Index2/`,
  },
  {
    name: "Indictment",
    expectedUrl: `${config.urls.base}Case/Indictment?caseKey=`,
  },
  {
    name: "Split",
    expectedUrl: `${config.urls.base}Case/Split?caseKey=`,
  },
  {
    name: "Merge",
    expectedUrl: `${config.urls.base}Case/Merge?caseKey=`,
  },
];
