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
  firstDefendant: Locator;
  progressBar : Locator;
   
constructor(page) {
    super(page);
    this.splitHeading = page.locator('.heading-small')
    this.noOfCasesTextBox = page.locator('#noCases')
    this.updateButton = page.locator('#btnUpdate')
    this.caseSelect1 = page.locator('#caseSelect1')
    this.caseSelect2 = page.locator('#caseSelect2')
    this.splitCaseButton = page.locator('#splitCase')
    this.caseNameTable = page.locator('#caseNameTable')
    this.newCaseName1 = page.locator("(//input[@name='newCaseName'])[1]")
    this.newCaseName2 = page.locator("(//input[@name='newCaseName'])[2]")
    this.newCaseUrn1 = page.locator("(//*[@id=\"newUrn\"])[1]")
    this.newCaseUrn2 = page.locator("(//*[@id=\"newUrn\"])[2]")
    this.caseListTable = page.locator('#caseListTable')
    this.firstDefendant = page.locator('//*[@id=\"caseListTable\"]/tbody/tr[1]/td[1]')
    this.progressBar = page.locator('.progress-bar')
}


async splitACase(caseName: string){
    await this.noOfCasesTextBox.fill('2')
    await expect (this.updateButton).toBeEnabled();
    await Promise.all([
    await expect (this.caseNameTable).toBeVisible(),
    await this.updateButton.click()]);

    await this.newCaseName1.fill(caseName+ "one")
    await this.newCaseName2.fill(caseName+ "two")
    const defendantLocator =  this.firstDefendant.getByText('Defendant Two');
    const defendantTwoIsVisible = await defendantLocator.isVisible();

    if (defendantTwoIsVisible) {
        // This block executes if 'Defendant Two' IS found and visible.
        await this.caseSelect1.selectOption("Case2");
        await this.caseSelect2.selectOption("Case1");

    } else {
        // This block executes if 'Defendant Two' is NOT found or is NOT visible.
        await this.caseSelect1.selectOption("Case1");
        await this.caseSelect2.selectOption("Case2");
    }
    
    await this.splitCaseButton.click();
}


async waitForSplitCaseCompletion(){
    await this.page.waitForTimeout(60_000);
    console.log('Split case completion')
}

}
export default SplitCasePage;

