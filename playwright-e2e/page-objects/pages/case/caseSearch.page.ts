import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { expect } from "../../../fixtures";
import { config } from "../../../utils";

/**
 * Represents the Case Search page, allowing users to find and interact with cases.
 * This Page Object provides locators and methods for searching cases,
 * applying filters, and navigating to case-specific actions like creating,
 * updating, or reviewing cases.
 */

class CaseSearchPage extends Base {
  caseSearchHeading: Locator;
  createCaseButton: Locator;
  textField: Locator;
  locationField: Locator;
  applyFilter: Locator;
  clearFilter: Locator;
  todayButton: Locator;
  fromDateCheckbox: Locator;
  toDateCheckbox: Locator;
  noCasesText: Locator;
  allWordsCheckbox: Locator;
  caseTableLoadIcon: Locator;
  caseTable: Locator;

  constructor(page) {
    super(page);
    this.caseSearchHeading = page.locator(".heading-medium");
    this.createCaseButton = page.getByRole("link", { name: "Create a Case" });
    this.textField = page.locator("#searchText");
    this.locationField = page.locator("#locationSelect");
    this.applyFilter = page.getByRole("link", { name: "Apply Filter" });
    this.clearFilter = page.getByRole("link", { name: "Clear Filter" });
    this.todayButton = page.getByRole("link", { name: "Today" });
    this.fromDateCheckbox = page.locator("#fromDateCheck");
    this.toDateCheckbox = page.locator("#toDateCheck");
    this.noCasesText = page.locator("#caseListDiv > h4");
    this.allWordsCheckbox = page.locator("#searchAllWords");
    this.caseTableLoadIcon = page.locator("#spinner");
    this.caseTable = page.locator("table.formTable-zebra");
  }

  async waitForCaseTableToLoad() {
    await expect(this.caseTableLoadIcon).toBeHidden({ timeout: 60_000 });
    await expect(this.caseTable).toBeVisible({
      timeout: 40_000,
    });
    const rowCount = await this.caseTable.locator("tr").count();
    console.log(`📊 Table loaded with ${rowCount} rows`);
  }
  /**
   * Retrieves the locator for a specific case row in the search results table
   * based on a text input (e.g., case name or URN) and an optional hearing date.
   * @returns {Locator} A Playwright Locator for the matching case row.
   */
  getCaseRowByTextInput(textFieldInput: string, hearingDate?: string) {
    let row = `tr:has(td.tableText:has-text("${textFieldInput}"))`;

    if (hearingDate) {
      row += `:has(td.tableText:has-text("${hearingDate}"))`;
    }

    return this.page.locator(row);
  }

  /**
   * Searches for a case using the provided text input, location, and optional hearing date.
   * Applies filters and includes retry logic to handle potential UI delays and hearing date flakiness.
   */
  async searchCaseFile(
    textFieldInput: string,
    location: string,
    hearingDate?: string,
  ) {
    await this.locationField.selectOption(location);
    await this.textField.clear();
    await this.textField.fill(textFieldInput);
    if (await this.fromDateCheckbox.isChecked()) {
      await this.fromDateCheckbox.uncheck();
    }
    if (await this.toDateCheckbox.isChecked()) {
      await this.toDateCheckbox.uncheck();
    }
    const allWordsChecked = await this.allWordsCheckbox.isChecked();
    if (!allWordsChecked) {
      await this.allWordsCheckbox.check();
    }
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const caseRowNoHearing = this.getCaseRowByTextInput(textFieldInput);

    let found = false;
    let foundWithHearing = false;
    let foundWithoutHearing = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      await this.applyFilter.click();

      await this.waitForCaseTableToLoad();

      try {
        await expect(caseRow).toHaveCount(1, { timeout: 30_000 });
        foundWithHearing = true;
      } catch {}

      if (!foundWithHearing) {
        try {
          await expect(caseRowNoHearing).toHaveCount(1, { timeout: 30_000 });
          foundWithoutHearing = true;
        } catch {}
      }

      found = foundWithHearing || foundWithoutHearing;
    }
    const allRows = await this.page
      .locator(".formTable-zebra tr")
      .allTextContents();

    const cleanedRows = allRows.map((row) => row.replace(/\s+/g, " ").trim());

    console.log(`
    🔍 Case Search Debug
    Search Input: ${textFieldInput}
    Hearing Date: ${hearingDate ?? "N/A"}

    Results:
    - With hearing date: ${foundWithHearing ? "✅ Found" : "❌ Not found"}
    - Without hearing date: ${foundWithoutHearing ? "✅ Found" : "❌ Not found"}

    Rows:
    ${cleanedRows.map((row, i) => `  ${i + 1}. ${row}`).join("\n")}
    `);
    return found;
  }

  async searchUnavailableCaseFile(
    textFieldInput: string,
    location: string,
    hearingDate?: string,
  ) {
    await this.locationField.selectOption(location);
    await this.textField.clear();
    await this.textField.fill(textFieldInput);
    if (await this.fromDateCheckbox.isChecked()) {
      await this.fromDateCheckbox.uncheck();
    }
    if (await this.toDateCheckbox.isChecked()) {
      await this.toDateCheckbox.uncheck();
    }
    const allWordsChecked = await this.allWordsCheckbox.isChecked();
    if (!allWordsChecked) {
      await this.allWordsCheckbox.check();
    }
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const caseRowNoHearing = this.getCaseRowByTextInput(textFieldInput);

    let found = false;
    let foundWithHearing = false;
    let foundWithoutHearing = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      await this.applyFilter.click();

      try {
        await expect(caseRow).toHaveCount(1, { timeout: 30_000 });
        foundWithHearing = true;
      } catch {}

      if (!foundWithHearing) {
        try {
          await expect(caseRowNoHearing).toHaveCount(1, { timeout: 30_000 });
          foundWithoutHearing = true;
        } catch {}
      }

      found = foundWithHearing || foundWithoutHearing;
    }
    const allRows = await this.page
      .locator(".formTable-zebra tr")
      .allTextContents();

    const cleanedRows = allRows.map((row) => row.replace(/\s+/g, " ").trim());

    console.log(`
    🔍 Case Search Debug
    Search Input: ${textFieldInput}
    Hearing Date: ${hearingDate ?? "N/A"}

    Results:
    - With hearing date: ${foundWithHearing ? "✅ Found" : "❌ Not found"}
    - Without hearing date: ${foundWithoutHearing ? "✅ Found" : "❌ Not found"}

    Rows:
    ${cleanedRows.map((row, i) => `  ${i + 1}. ${row}`).join("\n")}
    `);
    return found;
  }

  async searchForAvailableCase(
    textFieldInput: string,
    location: string,
    hearingDate?: string,
  ) {
    const found = await this.searchCaseFile(
      textFieldInput,
      location,
      hearingDate,
    );
    if (!found) {
      throw new Error(
        `❌ Case "${textFieldInput}" did not appear (with or without hearing) after applying filter`,
      );
    }
  }

  /**
   * Clicks the "Create a Case" button to navigate to the case creation page.
   */
  async goToCreateCase() {
    await this.createCaseButton.click();
  }

  /**
   * Helper function for case search row navigation.
   */
  private async rowNavigation(
    navigationAction: string,
    textFieldInput: string,
    hearingDate?: string,
  ) {
    const caseRowWithHearing = this.getCaseRowByTextInput(
      textFieldInput,
      hearingDate,
    );

    const caseRowWithoutHearing = this.getCaseRowByTextInput(textFieldInput);

    let button;

    // Try WITH hearing date first
    if (await caseRowWithHearing.count()) {
      button = caseRowWithHearing
        .getByRole("link", { name: navigationAction })
        .first();
    } else {
      button = caseRowWithoutHearing
        .getByRole("link", { name: navigationAction })
        .first();
    }

    await button.waitFor({ state: "visible", timeout: 15000 });
    await button.click();
  }

  /**
   * Navigates to the "Update Case" page for a specific case.
   * @returns {Promise<boolean>} Resolves to true if navigation is successful.
   */
  async goToUpdateCase(textFieldInput: string, hearingDate?: string) {
    await this.rowNavigation("Update Case", textFieldInput, hearingDate);
    return true;
  }

  /**
   * Navigates to the "Review Evidence" page for a specific case.
   */
  async goToReviewEvidence(textFieldInput: string, hearingDate?: string) {
    await this.rowNavigation("Review Evidence", textFieldInput, hearingDate);
  }

  /**
   * Navigates to the "Update Front Page" for a specific case.
   */
  async goToUpdateFrontPage(textFieldInput: string, hearingDate?: string) {
    await this.rowNavigation("Update Front Page", textFieldInput, hearingDate);
  }

  /**
   * Confirms the deletion of a case by verifying the "no cases" text is displayed.
   * Includes retry logic to account for potential UI delays after deletion.
   * @returns {Promise<boolean>} Resolves to true if case deletion is confirmed, otherwise false.
   */
  async confirmCaseDeletion(
    textFieldInput: string,
    location: string,
    hearingDate?: string,
  ) {
    await this.page.goto(
      `${config.urls.base}Case/CaseIndex?currentFirst=1&displaySize=10`,
    );
    const found = await this.searchUnavailableCaseFile(
      textFieldInput,
      location,
      hearingDate,
    );
    if (found) {
      const rowWithHearing = this.getCaseRowByTextInput(
        textFieldInput,
        hearingDate,
      );
      const rowWithoutHearing = this.getCaseRowByTextInput(textFieldInput);

      const withHearingCount = await rowWithHearing.count();
      const withoutHearingCount = await rowWithoutHearing.count();

      const allRows = await this.page
        .locator(".formTable-zebra tr")
        .allTextContents();

      const cleanedRows = allRows.map((row) => row.replace(/\s+/g, " ").trim());

      console.log("Cleaned rows:", cleanedRows);

      throw new Error(`
        ❌ Case deletion unsuccessful

        Search Input: ${textFieldInput}
        Hearing Date: ${hearingDate}

        Results:
        - With hearing date: ${withHearingCount}
        - Without hearing date: ${withoutHearingCount}
      `);
    }

    await expect(this.noCasesText).toBeVisible({ timeout: 40000 });
    await expect(this.noCasesText).toHaveText(
      /There are no cases on the system/i,
    );
  }
}

export default CaseSearchPage;
