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
  caseTableDiv: Locator;
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
    this.caseTableDiv = page.locator("#caseListDiv");
    this.caseTable = this.caseTableDiv.locator("table.formTable-zebra");
  }

  async waitForCaseTableToLoad() {
    await expect(this.caseTableLoadIcon).toBeHidden({ timeout: 60_000 });
    await expect(this.caseTableDiv).toBeVisible({ timeout: 60_000 });
    try {
      await this.caseTable.waitFor({ state: "attached", timeout: 40_000 });
    } catch {
      console.warn("⚠️ No results table rendered after search");
    }
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

    let foundWithHearing = false;
    let foundWithoutHearing = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      await this.applyFilter.click();
      console.log(`Attempt ${attempt + 1} - Searching for ${textFieldInput}`);

      await this.waitForCaseTableToLoad();

      const rowWithHearing = this.getCaseRowByTextInput(
        textFieldInput,
        hearingDate,
      );
      const rowWithoutHearing = this.getCaseRowByTextInput(textFieldInput);

      const withHearingCount = hearingDate ? await rowWithHearing.count() : 0;

      const withoutHearingCount = await rowWithoutHearing.count();

      foundWithHearing = withHearingCount > 0;
      foundWithoutHearing = withoutHearingCount > 0;

      console.log(`
    - With hearing: ${withHearingCount}
    - Without hearing: ${withoutHearingCount}
    `);

      if (foundWithHearing || foundWithoutHearing) {
        break; // ✅ success
      }

      // 🔍 Optional: detect "no results"
      const noResultsVisible = await this.page
        .locator("text=There are no cases on the system")
        .isVisible()
        .catch(() => false);

      if (noResultsVisible) {
        console.warn(`⚠️ No results message shown for: ${textFieldInput}`);
      }

      await this.page.waitForTimeout(2000);
    }

    // 🔍 Final state debug
    const allRows = await this.page
      .locator(".formTable-zebra tr")
      .allTextContents();

    const cleanedRows = allRows.map((row) => row.replace(/\s+/g, " ").trim());

    const result = {
      found: foundWithHearing || foundWithoutHearing,
      foundWithHearing,
      foundWithoutHearing,
      rowCount: cleanedRows.length,
      rows: cleanedRows,
    };

    console.log(`
      🔍 Case Search Debug
      Search Input: ${textFieldInput}
      Hearing Date: ${hearingDate ?? "N/A"}

      Results:
      - With hearing date: ${result.foundWithHearing ? "✅ Found" : "❌ Not found"}
      - Without hearing date: ${result.foundWithoutHearing ? "✅ Found" : "❌ Not found"}
      - Row count: ${result.rowCount}

      Rows:
      ${result.rows.length ? result.rows.map((row, i) => `  ${i + 1}. ${row}`).join("\n") : "  (no rows)"}
    `);

    // Fail if not found
    if (!result.found) {
      throw new Error(`
      ❌ Case NOT found but was expected

      Search Input: ${textFieldInput}
      Hearing Date: ${hearingDate ?? "N/A"}

      Results:
      - With hearing date: ${result.foundWithHearing ? "✅ Found" : "❌ Not found"}
      - Without hearing date: ${result.foundWithoutHearing ? "✅ Found" : "❌ Not found"}
      - Row count: ${result.rowCount}
    `);
    }

    return result;
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

    let foundWithHearing = false;
    let foundWithoutHearing = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      await this.applyFilter.click();

      const rowWithHearing = this.getCaseRowByTextInput(
        textFieldInput,
        hearingDate,
      );
      const rowWithoutHearing = this.getCaseRowByTextInput(textFieldInput);

      const withHearingCount = hearingDate ? await rowWithHearing.count() : 0;

      const withoutHearingCount = await rowWithoutHearing.count();

      foundWithHearing = withHearingCount > 0;
      foundWithoutHearing = withoutHearingCount > 0;

      console.log(`
    🔁 Attempt ${attempt + 1}
    - With hearing: ${withHearingCount}
    - Without hearing: ${withoutHearingCount}
    `);

      if (foundWithHearing || foundWithoutHearing) {
        break; // ✅ stop retrying once found
      }

      // small buffer for indexing / async backend
      await this.page.waitForTimeout(2000);
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
    return {
      found: foundWithHearing || foundWithoutHearing,
      foundWithHearing,
      foundWithoutHearing,
      rowCount: cleanedRows.length,
      rows: cleanedRows,
    };
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
    const searchResult = await this.searchUnavailableCaseFile(
      textFieldInput,
      location,
      hearingDate,
    );
    if (searchResult.found) {
      throw new Error(`
      ❌ Case deletion unsuccessful

      Search Input: ${textFieldInput}
      Hearing Date: ${hearingDate ?? "N/A"}

      Results:
      - With hearing date: ${searchResult.foundWithHearing ? "✅ Found" : "❌ Not found"}
      - Without hearing date: ${searchResult.foundWithoutHearing ? "✅ Found" : "❌ Not found"}
      - Row count: ${searchResult.rowCount}
      - Rows: ${searchResult.rows.join("\n")}
    `);
    }

    await expect(this.noCasesText).toBeVisible({ timeout: 40000 });
    await expect(this.noCasesText).toHaveText(
      /There are no cases on the system/i,
    );
  }
}

export default CaseSearchPage;
