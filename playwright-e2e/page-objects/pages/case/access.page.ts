import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { expect } from "../../../fixtures";

/**
 * Represents the "Access Page" functionality, typically used for
 * enabling or modifying case access at a Role level, or Email Domain
 * level
 */
class AccessPage extends Base {
  addDomainButton: Locator;
  emailDomainsTable: Locator;

  constructor(page) {
    super(page);
    this.addDomainButton = page.getByRole("link", {
      name: "Add a Defence Email Domain",
    });
    this.emailDomainsTable = page.locator(".formTable-zebra").last();
  }
  async navigateToAddDomain() {
    await this.addDomainButton.click();
  }

  async verifyEmailDomain(domain) {
    await expect(this.emailDomainsTable).toContainText(domain);
  }
}

export default AccessPage;
