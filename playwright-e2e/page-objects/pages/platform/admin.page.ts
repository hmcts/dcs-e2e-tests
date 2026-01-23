import { Locator, expect } from "@playwright/test";
import { Base } from "../../base";

/**
 * Represents the Administration Options page in the application.
 * This Page Object provides locators and methods to interact with administrative
 * functionalities, such as navigating to user management.
 */
class AdminPage extends Base {
  adminHeading: Locator;
  usersLink: Locator;

  constructor(page) {
    super(page);
    this.adminHeading = page.locator("div#content h2");
    this.usersLink = page.getByRole("link", { name: "Users" });
  }

  /**
   * Navigates to the Users management page from the administration page.
   */
  async navigateToUsers() {
    await expect(this.adminHeading).toContainText("Administration Options");
    await this.usersLink.click();
  }
}
export default AdminPage;
