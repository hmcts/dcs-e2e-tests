import { userConfig } from "../utils";

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
    expectedUrl: `${userConfig.urls.preProdBaseUrl}`,
  },
  {
    name: "LogOn",
    expectedTitle: "Log On",
    expectedUrl: `${userConfig.urls.preProdBaseUrl}Account/LogOn`,
  },
  {
    name: "Register",
    expectedTitle: "Register",
    expectedUrl: `${userConfig.urls.preProdBaseUrl}Account/Register`,
  },
  {
    name: "ContactUs",
    expectedTitle: "ContactUs",
    expectedUrl: `${userConfig.urls.preProdBaseUrl}Home/ContactUs`,
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
    expectedUrl: `${userConfig.urls.preProdBaseUrl}Person/Details?personKey=`,
  },
  {
    name: "LogOff",
    expectedTitle: "CCDCS",
    expectedUrl: `${userConfig.urls.preProdBaseUrl}`,
  },
  {
    name: "ViewCaseListLink",
    expectedTitle: "Case List",
    expectedUrl: `${userConfig.urls.preProdBaseUrl}Case/CaseIndex`,
  },
];
