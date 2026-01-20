import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

class SplitCasePage extends Base {
  splitHeading: Locator;
  noOfCasesTextBox: Locator;
  updateButton: Locator;
  caseSelect1: Locator;
  caseSelect2: Locator;
  splitCaseButton: Locator;
  caseNameTable: Locator;
  newCaseName1: Locator;
  newCaseName2: Locator;
  newCaseUrn1: Locator;
  newCaseUrn2: Locator;
  caseListTable: Locator;
  firstDefendantInTable: Locator;
  progressBar: Locator;
  defendantsTable: Locator;

  constructor(page) {
    super(page);
    this.splitHeading = page.locator(".heading-small");
    this.noOfCasesTextBox = page.locator("#noCases");
    this.updateButton = page.locator("#btnUpdate");
    this.caseSelect1 = page.locator("#caseSelect1");
    this.caseSelect2 = page.locator("#caseSelect2");
    this.splitCaseButton = page.locator("#splitCase");
    this.caseNameTable = page.locator("#caseNameTable");
    this.newCaseName1 = page.locator("#newCaseName").first();
    this.newCaseName2 = page.locator("#newCaseName").nth(1);
    this.newCaseUrn1 = page.locator("#newUrn").first();
    this.newCaseUrn2 = page.locator("#newUrn").nth(1);
    this.caseListTable = page.locator("#caseListTable");
    this.defendantsTable = page.locator("#caseListTable");
    this.firstDefendantInTable = this.defendantsTable
      .locator("tbody tr")
      .first()
      .locator("td")
      .first();
    this.progressBar = page.locator(".progress-bar");
  }

  async splitCase(caseName: string) {
    await this.noOfCasesTextBox.fill("2");
    await expect(this.updateButton).toBeEnabled();
    await Promise.all([
      await expect(this.caseNameTable).toBeVisible(),
      await this.updateButton.click(),
    ]);

    await this.newCaseName1.fill(caseName + "One");
    await this.newCaseName2.fill(caseName + "Two");

    const firstDefendantInTableText =
      await this.firstDefendantInTable.textContent();

    if (firstDefendantInTableText!.includes("Defendant One")) {
      await this.caseSelect1.selectOption("Case1");
      await this.caseSelect2.selectOption("Case2");
    } else {
      await this.caseSelect1.selectOption("Case2");
      await this.caseSelect2.selectOption("Case1");
    }
    await this.splitCaseButton.click();
    const progressText = await this.progressBar.textContent();
    await expect(this.progressBar).toContainText("Preparing", {
      timeout: 60_000,
    });
    if (!progressText?.includes("Preparing")) {
      await this.caseNavigation.navigateTo("CaseHome");
    }
  }
}

export default SplitCasePage;
