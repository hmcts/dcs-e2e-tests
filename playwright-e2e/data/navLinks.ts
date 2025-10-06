import { config } from "../utils";

export const externalLinks: {
  name: string;
  expectedTitle: string;
  expectedUrl: string;
}[] = [
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

export const internalLinksLoggedOut: {
  name: string;
  expectedTitle: string;
  expectedUrl: string;
}[] = [
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

export const internalLinksLoggedIn: {
  name: string;
  expectedTitle: string;
  expectedUrl: string;
}[] = [
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
