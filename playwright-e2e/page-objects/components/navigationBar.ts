import { Page, Locator } from "@playwright/test";

type NavLink = string;

class NavigationBar {
  page: Page;
  links: Record<NavLink, Locator>;
  loggedOutLinks: NavLink[] = [];
  loggedInLinks: NavLink[] = [];

  constructor(page: Page) {
    this.page = page;
    this.links = {
      Home: page.getByRole("link", { name: "Home" }),
      Accessibility: page.getByRole("link", { name: "Accessibility" }),
      LogOn: page.getByRole("link", { name: "Log On" }),
      Register: page.getByRole("link", { name: "Register" }),
      ContactUs: page.getByRole("link", { name: "Contact Us" }),
      Guidance: page.getByRole("link", {
        name: "Guidance",
        exact: true,
      }),
      AccountDetails: page.getByRole("link", {
        name: "Account Details",
      }),
      LogOff: page.getByRole("link", { name: "Log Off" }),
      ViewCaseListLink: page.getByRole("link", { name: "View Case List" }),
      ApprovalRequestsLink: page.getByRole('link', { name: 'Approval Requests' })

    };
  }

  async navigateTo(link: NavLink) {
    const locator = this.links[link];
    if (!locator) {
      throw new Error(`Link "${link}" does not exist in the navigation bar`);
    }
    await locator.click();
  }
}

export default NavigationBar;
