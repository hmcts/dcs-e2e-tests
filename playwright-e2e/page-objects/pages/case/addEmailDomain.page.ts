import { Locator } from "@playwright/test";
import { Base } from "../../base";

/**
 * Represents the "Add Email Domain Page" functionality, used for adding
 * a new email domain to the case Defence Email Domains access table.
 */
class AddEmailDomainPage extends Base {
  domainInputField: Locator;
  searchDomainButton: Locator;
  domainsTable: Locator;

  constructor(page) {
    super(page);
    this.domainInputField = page.locator("#cjsmDomainSearchBox");
    this.searchDomainButton = page.getByRole("button", {
      name: "Search Domain",
    });
    this.domainsTable = page.locator("#cjsmDomainsTable");
  }
  async addEmailDomain(defendant, domain) {
    await this.page.getByRole("checkbox", { name: `${defendant} -` }).check();
    await this.domainInputField.fill(domain);
    await this.searchDomainButton.click();
    const row = this.domainsTable.locator("tr").filter({ hasText: domain });

    const addButton = row.locator("button.add-domain");
    await addButton.click();
  }
}

export default AddEmailDomainPage;
