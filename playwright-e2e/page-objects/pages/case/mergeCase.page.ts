import { Locator, expect } from "@playwright/test";
import { Base } from "../../base";

/**
 * Represents the "Merge Cases" page, where users can combine two existing cases with
 * Defendants into one.
 * This Page Object provides locators and methods to initiate a case merge,
 * specify the new merged case details, and wait for the merge operation to complete.
 */
class MergeCasePage extends Base {
  mergeHeading: Locator;
  newCaseName: Locator;
  newCaseUrn: Locator;
  findCaseToMerge: Locator;
  mergeCaseSelect: Locator;
  mergeCasesButton: Locator;
  progressBar: Locator;
  caseListTable: Locator;

  constructor(page) {
    super(page);
    this.mergeHeading = page.getByText("Merge Cases", { exact: true });
    this.newCaseName = page.locator("#newName");
    this.newCaseUrn = page.locator("#newUrn");
    this.findCaseToMerge = this.page.locator("#Search");
    this.mergeCaseSelect = page.locator(".typeahead");
    this.mergeCasesButton = page.getByRole("link", { name: "Merge cases" });
    this.progressBar = page.locator("div.progress");
    this.caseListTable = page.locator("#caseListTable");
  }

  /**
   * Initiates the process of merging two cases.
   * Fills in the new URN, selects the second case to merge, and clicks the merge button.
   */
  async mergeCases(caseName1: string, caseName2: string) {
    await expect(this.newCaseUrn).toBeEditable();
    await this.newCaseUrn.clear();
    await this.newCaseUrn.fill(caseName1 + "(M)");
    await expect(this.mergeCaseSelect).toBeEnabled();
    await this.findCaseToMerge.fill(caseName2);
    await this.page.getByRole("option", { name: caseName2 }).click();
    const caseRow = this.caseListTable.locator("tr").nth(1);
    await expect(caseRow.locator("td:nth-child(3)")).not.toBeEmpty({
      timeout: 20000,
    }); // Ensures defendants have been loaded (merge prerequisite)
    await expect(this.mergeCasesButton).toBeVisible({ timeout: 20000 });
    await this.mergeCasesButton.click();
    const progressText = await this.progressBar.textContent();
    await expect(this.progressBar).toContainText("Preparing", {
      timeout: 60_000,
    });
    if (!progressText?.includes("Preparing")) {
      await this.caseNavigation.navigateTo("CaseHome");
    }
  }
}
export default MergeCasePage;
