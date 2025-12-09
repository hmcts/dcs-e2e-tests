import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";

class CaseSearchPage extends Base {
  caseSearchHeading: Locator;
  createCaseButton: Locator;
  textField: Locator;
  viewCaseListLink: Locator;
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
    this.viewCaseListLink = page.getByRole("link", { name: "View Case List" });
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

  getCaseRowByTextInput(textFieldInput: string, hearingDate?: string) {
    let selector = `tr:has(td.tableText:has-text("${textFieldInput}"))`;

    if (hearingDate) {
      selector += `:has(td.tableText:has-text("${hearingDate}"))`;
    }

    return this.page.locator(selector);
  }

  async searchCaseFile(
    textFieldInput: string,
    location: string,
    hearingDate?: string
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
    for (let i = 0; i < 2; i++) {
      // TEMP FIX: try up to 2 times (need to address with Dev team: glitch often occurs where Apply Filter needs to be clicked twice before the right case will show)
      await this.applyFilter.click();
      const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
      try {
        await caseRow.waitFor({ state: "visible", timeout: 5000 });
        return; // success
      } catch {
        if (i === 1)
          // Final attempt, throw test failure if case not found
          await expect(caseRow).toBeVisible({ timeout: 20000 });
        // otherwise retry loop
      }
    }
  }

  async goToCreateCase() {
    await this.createCaseButton.click();
  }

  async goToUpdateCase(textFieldInput, hearingDate?) {
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const updateBtn = caseRow.getByRole("link", { name: "Update Case" });
    await expect(updateBtn).toBeVisible({ timeout: 5000 });
    await updateBtn.click();
    return true;
  }

  async goToReviewEvidence(textFieldInput, hearingDate?) {
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const reviewEvidenceBtn = caseRow.getByRole("link", {
      name: "Review Evidence",
    });
    await expect(reviewEvidenceBtn).toBeVisible({ timeout: 5000 });
    return reviewEvidenceBtn.click();
  }

  async goToUpdateFrontPage(textFieldInput, hearingDate?) {
    const caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);
    const updateFrntPageBtn = caseRow.getByRole("link", {
      name: "Update Front Page",
    });
    await expect(updateFrntPageBtn).toBeVisible({ timeout: 5000 });
    await updateFrntPageBtn.click();
  }

  async confirmCaseDeletion() {
    try {
      await this.applyFilter.click();
      await this.noCasesText.waitFor({ state: "visible", timeout: 40000 });
      return await expect(this.noCasesText).toHaveText(
        /There are no cases on the system/i
      );
    } catch {
      return false;
    }
  }
}

export default CaseSearchPage;
