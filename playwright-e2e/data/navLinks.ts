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
    expectedUrl: `${config.urls.preProdBaseUrl}`,
  },
  {
    name: "LogOn",
    expectedTitle: "Log On",
    expectedUrl: `${config.urls.preProdBaseUrl}Account/LogOn`,
  },
  {
    name: "Register",
    expectedTitle: "Register",
    expectedUrl: `${config.urls.preProdBaseUrl}Account/Register`,
  },
  {
    name: "ContactUs",
    expectedTitle: "ContactUs",
    expectedUrl: `${config.urls.preProdBaseUrl}Home/ContactUs`,
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
    expectedUrl: `${config.urls.preProdBaseUrl}Person/Details?personKey=`,
  },
  {
    name: "LogOff",
    expectedTitle: "CCDCS",
    expectedUrl: `${config.urls.preProdBaseUrl}`,
  },
  {
    name: "ViewCaseListLink",
    expectedTitle: "Case List",
    expectedUrl: `${config.urls.preProdBaseUrl}Case/CaseIndex`,
  },
];
