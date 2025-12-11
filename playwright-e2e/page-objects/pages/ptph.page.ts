import { Locator } from "@playwright/test";
import { Base } from "../base";

class PTPHPage extends Base {
  ptphForm: Locator;
  prosecutionContacts: Locator;

  constructor(page) {
    super(page);
    this.ptphForm = page.locator("#reviewform");
    this.prosecutionContacts = page.locator("table.composite-table", {
      has: page.locator("td.bigtitle:has-text('Prosecution Contacts')"),
    });
  }
}

export default PTPHPage;
