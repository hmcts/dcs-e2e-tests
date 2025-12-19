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

  async searchCaseFileWithFallback(
    textFieldInput: string,
    location: string,
    hearingDate?: string
  ) {
    await this.locationField.selectOption(location);
    await this.textField.clear();
    await this.textField.fill(textFieldInput);
    if (await this.fromDateCheckbox.isChecked())
      await this.fromDateCheckbox.uncheck();
    if (await this.toDateCheckbox.isChecked())
      await this.toDateCheckbox.uncheck();

    let caseRow = this.getCaseRowByTextInput(textFieldInput, hearingDate);

    for (let attempt = 0; attempt < 3; attempt++) {
      await this.applyFilter.click();
      try {
        await expect(caseRow).toHaveCount(1, { timeout: 30000 });
        await expect(caseRow).toBeVisible({ timeout: 30000 });
        return;
      } catch {
        // If hearingDate was specified, try again without it
        if (hearingDate) {
          caseRow = this.getCaseRowByTextInput(textFieldInput); // ignore date
          try {
            await expect(caseRow).toHaveCount(1, { timeout: 30000 });
            await expect(caseRow).toBeVisible({ timeout: 30000 });
            return;
          } catch {}
        }

        if (attempt === 2) {
          throw new Error(
            `❌ Case row "${textFieldInput}" (hearing: ${hearingDate}) did not appear after applying filter`
          );
        }
        await this.page.waitForTimeout(1000); // small delay before retry
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

      const text = await this.noCasesText.textContent();
      console.log("DELETION TEXT", text);
      return text?.match(/There are no cases on the system/i) !== null;
    } catch {
      return false;
    }
  }
}

export default CaseSearchPage;
