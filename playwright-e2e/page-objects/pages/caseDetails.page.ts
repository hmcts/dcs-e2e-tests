import { Locator } from "@playwright/test";
import { Base } from "../base";

class CaseDetailsPage extends Base {
  caseNameHeading: Locator;
  caseDetailsHeading: Locator;
  addDefButton: Locator;
  changeCaseButton: Locator
  nameDefOne: Locator;
  nameDefTwo: Locator;
  verifyAdditionalNotes: Locator;

constructor(page) {
    super(page);
    this.caseNameHeading = page.locator(".heading-medium");
    this.caseDetailsHeading = page.locator("legend.heading-small");
    this.addDefButton = page.getByRole("link", {name: "Add Defendant"});
    this.changeCaseButton = page.locator("xpath=(//a[@class='button-level-one'])[1]")
    this.nameDefOne = page. getByRole('cell', { name: 'Defendant One', exact: true })
    this.nameDefTwo = page.getByRole('cell', { name: 'Defendant Two', exact: true })
    this.verifyAdditionalNotes = page.locator("xpath= //td[normalize-space()='Test additional notes']")
}

async goToAddDefendant(){
    await this.addDefButton.click();
}

async goToChangeCaseDetails(){
    await this.changeCaseButton.click(); 
}}

export default CaseDetailsPage;
