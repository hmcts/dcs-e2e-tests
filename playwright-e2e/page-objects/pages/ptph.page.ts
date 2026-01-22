import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";

/**
 * Represents the PTPH (Plea and Trial Preparation Hearing) form page.
 * This Page Object provides locators and methods to interact with and validate
 * the various sections of the PTPH form, which is crucial for tests
 * involving case progression and trial preparation.
 */
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
  pageLoader: Locator;

  constructor(page) {
    super(page);
    this.pageLoader = page.locator("#loader");
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

  /**
   * Waits for the PTPH form to be fully loaded and visible on the page,
   * specifically ensuring that the page loader is no longer visible.
   */
  async ptphFormLoad() {
    await expect
      .poll(
        async () => {
          const loaderVisible = await this.pageLoader.isVisible();
          const formVisible = await this.ptphForm.isVisible();
          return !loaderVisible && formVisible;
        },
        {
          timeout: 120000,
          message: "Waiting for loader to disappear and form to be visible",
        }
      )
      .toBe(true);
  }

  /**
   * Returns an array of objects, each representing a major section of the PTPH form.
   * Each object contains the section's name (for identification) and its Playwright Locator.
   */
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
