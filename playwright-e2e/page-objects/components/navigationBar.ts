import { Page, Locator } from "@playwright/test";

type NavLink = string;

/**
 * Represents the main application navigation bar, available across different pages.
 * This component provides methods to interact with general navigation links,
 * such as "Home", "Log On", "Log Off", etc., regardless of the current case context.
 */
class NavigationBar {
  page: Page;
  /**
   * A map of navigation link names to their respective Playwright Locators.
   * This allows for easy access and interaction with specific navigation items.
   */
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
      // Admin role specific links
      ApprovalRequests: page.getByRole("link", { name: "Approval Requests" }),
      Admin: page.getByRole("link", { name: "Admin" }),
    };
  }

  /**
   * Navigates to a specific link within the main navigation bar.
   */
  async navigateTo(link: NavLink) {
    const locator = this.links[link];
    if (!locator) {
      throw new Error(`Link "${link}" does not exist in the navigation bar`);
    }
    await locator.click();
  }

  /**
   * Performs the log off action and waits for the log on link to become visible,
   * indicating a successful log off. Includes retry logic due to observed flakiness.
   */
  async logOff() {
    const logOff = this.links.LogOff;
    const logOn = this.links.LogOn;

    if (!logOff) {
      throw new Error(`Log Off link does not exist in the navigation bar`);
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      await logOff.click();

      try {
        await logOn.waitFor({ state: "visible", timeout: 10_000 });
        return; // successfully logged off
      } catch {
        // retry
      }
    }

    throw new Error(`❌ Log Off was unsuccessful`);
  }
}

export default NavigationBar;
