import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { expect } from "../../../fixtures";

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
  updateCaseButton: Locator;
  reviewEvidenceButton: Locator;
  updateFrontPageButton: Locator;
  noCasesText: Locator;

  constructor(page) {
    super(page);
    this.caseSearchHeading = page.locator(".heading-medium");
    this.createCaseButton = page.getByRole("link", { name: "Create a Case" });
    this.textField = page.locator("#searchText");
    this.locationField = page.locator("#locationSelect");
    this.applyFilter = page.getByRole("link", { name: "Apply Filter" });
    this.clearFilter = page.getByRole("link", { name: "Clear Filter" });
    this.todayButton = page.getByRole("link", { name: "Today" });
    this.updateCaseButton = page.getByRole("link", { name: "Update Case" });
    this.reviewEvidenceButton = page.getByRole("link", {
      name: "Review Evidence",
    });
    this.updateFrontPageButton = page.getByRole("link", {
      name: "Update Front Page",
    });
    this.fromDateCheckbox = page.locator("#fromDateCheck");
    this.toDateCheckbox = page.locator("#toDateCheck");
    this.noCasesText = page.locator("#caseListDiv > h4");
  }

  /**
   * Retrieves the locator for a specific case row in the search results table
   * based on a text input (e.g., case name or URN) and an optional hearing date.
   * @returns {Locator} A Playwright Locator for the matching case row.
   */
  getCaseRowByTextInput(textFieldInput: string, hearingDate?: string) {
    let selector = `tr:has(td.tableText:has-text("${textFieldInput}"))`;

    if (hearingDate) {
      selector += `:has(td.tableText:has-text("${hearingDate}"))`;
    }

    return this.page.locator(selector);
  }

  /**
   * Searches for a case using the provided text input, location, and optional hearing date.
   * Applies filters and includes retry logic to handle potential UI delays.
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
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const caseRowNoHearing = this.getCaseRowByTextInput(textFieldInput);

    let found = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      await this.applyFilter.click();

      // Search case WITH hearing
      try {
        await expect(caseRow).toHaveCount(1, { timeout: 20_000 });
        await expect(caseRow).toBeVisible({ timeout: 20_000 });
        found = true;
        break;
      } catch {}

      // Try case WITHOUT hearing
      try {
        await expect(caseRowNoHearing).toHaveCount(1, { timeout: 20_000 });
        await expect(caseRowNoHearing).toBeVisible({ timeout: 20_000 });
        found = true;
        break;
      } catch {}
    }

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
   * Navigates to the "Update Case" page for a specific case.
   * @returns {Promise<boolean>} Resolves to true if navigation is successful.
   */
  async goToUpdateCase(textFieldInput: string, hearingDate?: string) {
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const updateBtn = caseRow.getByRole("link", { name: "Update Case" });
    await expect(updateBtn).toBeVisible({ timeout: 5000 });
    await updateBtn.click();
    return true;
  }

  /**
   * Navigates to the "Review Evidence" page for a specific case.
   */
  async goToReviewEvidence(textFieldInput: string, hearingDate?: string) {
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const reviewEvidenceBtn = caseRow.getByRole("link", {
      name: "Review Evidence",
    });
    await expect(reviewEvidenceBtn).toBeVisible({ timeout: 5000 });
    return reviewEvidenceBtn.click();
  }

  /**
   * Navigates to the "Update Front Page" for a specific case.
   */
  async goToUpdateFrontPage(textFieldInput: string, hearingDate?: string) {
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const updateFrntPageBtn = caseRow.getByRole("link", {
      name: "Update Front Page",
    });
    await expect(updateFrntPageBtn).toBeVisible({ timeout: 5000 });
    await updateFrntPageBtn.click();
  }

  /**
   * Confirms the deletion of a case by verifying the "no cases" text is displayed.
   * Includes retry logic to account for potential UI delays after deletion.
   * @returns {Promise<boolean>} Resolves to true if case deletion is confirmed, otherwise false.
   */
  async confirmCaseDeletion() {
    try {
      await this.applyFilter.click();
      await this.noCasesText.waitFor({ state: "visible", timeout: 40000 });
      return await expect(this.noCasesText).toHaveText(
        /There are no cases on the system/i,
      );
    } catch {
      return false;
    }
  }
}

export default CaseSearchPage;
