import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

class AdminPage extends Base {
  adminHeading: Locator;
  usersLink: Locator;

  constructor(page) {
    super(page);
    this.adminHeading = page.locator("div#content h2");
    this.usersLink = page.getByRole("link", { name: "Users" });
  }

  async navigateToUsers() {
    await expect(this.adminHeading).toContainText("Administration Options");
    await this.usersLink.click();
  }
}
export default AdminPage;
