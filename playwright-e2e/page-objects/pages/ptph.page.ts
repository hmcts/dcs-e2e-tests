import { Locator } from "@playwright/test";
import { Base } from "../base";

class PTPHPage extends Base {
  ptphForm: Locator;
  // Form Sections
  prosecutionContacts: Locator;
  courtCaseProgression: Locator;
  defendant: Locator;
  defenceContacts: Locator;
  prosecutionInfo: Locator;
  defenceInfo: Locator;
  allPartiesInfo: Locator;
  prosecutionWitnesses: Locator;
  intermediary: Locator;

  constructor(page) {
    super(page);
    this.ptphForm = page.locator("#reviewform");
    this.defendant = this.defendant = page
      .locator("table.composite-table")
      .filter({
        has: page.locator("td.centertext:has-text('Defendant')"),
      })
      .filter({
        has: page.locator("td.centertext:has-text('Principal Charges')"),
      });
    this.prosecutionContacts = page.locator("table.composite-table", {
      has: page.locator("td.bigtitle:has-text('Prosecution Contacts')"),
    });
    this.courtCaseProgression = page.locator("table.composite-table", {
      has: page.locator("td.bigtitle:has-text('Court Case Progression')"),
    });
    this.defenceContacts = page.locator("table.composite-table", {
      has: page.locator("td.bigtitle:has-text('Defence Contacts')"),
    });
    this.prosecutionInfo = page.locator("table.composite-table", {
      has: page.locator(
        "td.bigtitle:has-text('Prosecution Information for PTPH')"
      ),
    });
    this.defenceInfo = page.locator("table.composite-table", {
      has: page.locator("td.bigtitle:has-text('Defence Information for PTPH')"),
    });
    this.allPartiesInfo = page.locator("table.composite-table", {
      has: page.locator("td.bigtitle:has-text('All Parties: Information')"),
    });
    this.prosecutionWitnesses = page.locator(
      "div[ng-if=\"section.type=='TableContainer'\"]",
      {
        has: page.locator(
          "div.heading-small:has-text('Prosecution Witnesses Required to Attend')"
        ),
      }
    );
    this.intermediary = page.locator(
      "div[ng-if=\"section.type=='ExpandableTableContainer'\"]",
      {
        has: page.locator(
          "div.heading-small:has-text('Intermediary Known at PTPH')"
        ),
      }
    );
  }

  async ptphFormSections() {
    return [
      { name: "prosecution-contacts", locator: this.prosecutionContacts },
      { name: "court-case-progression", locator: this.courtCaseProgression },
      { name: "defendant", locator: this.defendant },
      { name: "defence-contacts", locator: this.defenceContacts },
      { name: "prosecution-information", locator: this.prosecutionInfo },
      { name: "defence-information", locator: this.defenceInfo },
      { name: "all-parties-information", locator: this.allPartiesInfo },
      { name: "prosecution-witnesses", locator: this.prosecutionWitnesses },
      { name: "intermediary", locator: this.intermediary },
    ];
  }
}

export default PTPHPage;
