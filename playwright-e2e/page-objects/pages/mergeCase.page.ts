import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

class MergeCasePage extends Base {
  mergeHeading: Locator;
  newCaseName: Locator;
  newCaseUrn: Locator;
  findMergeCase: Locator;
  mergeCasesButton: Locator;
  progressBar : Locator;
  mergeCaseSelect: Locator;
  caseListTable: Locator;
  
constructor(page) {
    super(page);
    this.mergeHeading = page.getByText('Merge Cases', { exact: true })
    this.newCaseName = page.locator('#newName')
    this.newCaseUrn = page.locator('#newUrn')
    this.findMergeCase = this.page.locator('#Search')
    this.mergeCaseSelect = page.locator('.typeahead')
    this.mergeCasesButton = page.getByRole('link', { name: 'Merge cases' });
    this.progressBar = page.locator('div.progress')
    this.caseListTable = page.locator('#caseListTable')
}

async mergeCases(caseName1: string, caseName2: string){
    await expect(this.newCaseUrn).toBeEditable();
    await this.newCaseUrn.clear();
    await this.newCaseUrn.fill(caseName1+'(M)')
    await expect (this.mergeCaseSelect).toBeEnabled();
    await this.findMergeCase.fill(caseName2)
    await this.page.getByRole("option", { name: caseName2 }).click();
    const caseRow = this.caseListTable.locator("tr").nth(1);
    await expect(caseRow.locator("td:nth-child(3)")).not.toBeEmpty({
      timeout: 20000,
    });
    await expect(this.mergeCasesButton).toBeVisible({ timeout: 20000 });
    await this.mergeCasesButton.click();
    // const progressBarFill = this.progressBar.locator("div.progress-bar");
    // await expect(progressBarFill).toHaveAttribute("aria-valuenow", /[1-9]/, {
    //   timeout: 20000,
    // });
    // await expect(progressBarFill).toHaveAttribute("aria-valuenow", "100", {
    //   timeout: 20000,
    // }); 

}
}
export default MergeCasePage;