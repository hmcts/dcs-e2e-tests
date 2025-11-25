import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

class MergeCasePage extends Base {
  mergeHeading: Locator;
  newCaseName: Locator;
  newCaseUrn: Locator;
  findMergeCase: Locator;
  removeFromMergeButton: Locator;
  mergeCasesButton: Locator;
  progressBar : Locator;
  iframe: Locator;
  mergeCaseSelect: Locator;
  caseListTable: Locator;
  
constructor(page) {
    super(page);
    this.mergeHeading = page.getByText('Merge Cases', { exact: true })
    this.newCaseName = page.locator('#newName')
    this.newCaseUrn = page.locator('#newUrn')
    this.findMergeCase = page.getByRole('textbox', { name: 'Case Name/URN' })
    this.mergeCaseSelect = page.locator('.typeahead')
    this.removeFromMergeButton = page.getByRole('link', { name: 'Remove from Merge' })
    // this.mergeCasesButton = page.getByRole('link', { name: 'Merge cases' });
    // this.mergeCasesButton = page.locator('#mergeCase')
    this.mergeCasesButton = page.locator('a:has-text("Merge cases")')
    this.progressBar = page.locator('div.progress')
    this.iframe = this.page.locator('icon-iframe')
    this.caseListTable = page.locator('#caseListTable')
}

async mergeCases(caseName1: string, caseName2: string){
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.page.waitForLoadState('networkidle');
    await expect(this.newCaseUrn).toBeEditable();
    await this.newCaseUrn.clear();
    await this.newCaseUrn.fill(caseName1+'(M)')
    await expect (this.mergeCaseSelect).toBeEnabled();
    await this.findMergeCase.fill(caseName2)
    await this.page.locator('#Search').fill(caseName2);
    await this.page.locator('strong').nth(0).click();
    await this.page.locator("td:nth-child(3)").isVisible({timeout: 20000});
    await expect(this.caseListTable).toBeEnabled();
    await expect(this.mergeCasesButton).toBeVisible({timeout: 20000});
    await this.mergeCasesButton.click();
    await this.mergeCasesButton.click({timeout: 20000});
    // await this.mergeCasesButton.click({force:true})
    // await this.mergeCasesButton.press('Enter');
    // await this.mergeCasesButton.dispatchEvent('click');
    // const exactMergeLink = this.page.locator('a[href="javascript:mergeCase()"]');
    // await exactMergeLink.click({timeout: 20000});
    // const mergeLink = this.page.getByRole('link', { name: 'Merge cases' })
    //                   .locator('[href*="mergeCase()"]');

    // await mergeLink.click();
    // this.page.evaluate(() => mergeCase())
}
}
export default MergeCasePage;