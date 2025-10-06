import { Locator } from "@playwright/test";
import { Base } from "../base";

class CaseDetailsPage extends Base {
  caseNameHeading: Locator;
  caseDetailsHeading: Locator;
  addDefButton: Locator;
  changeCaseButton: Locator;
  dropdownIsInvitationOnly: Locator;
  dropdownCategory: Locator;
  otherCategory: Locator;
  isCompleteCheckBox: Locator;
  additionalNotes: Locator;
  saveChangeCaseButton: Locator;
  

constructor(page) {
    super(page);
    this.caseNameHeading = page.locator(".heading-medium");
    this.caseDetailsHeading = page.locator("legend.heading-small");
    this.addDefButton = page.getByRole("link", {name: "Add Defendant"});
    this.changeCaseButton = page.locator("xpath=(//a[@class='button-level-one'])[1]")
    this.dropdownIsInvitationOnly = page.locator('#ddIsInvitationOnly')
    this.dropdownCategory = page.locator('#categoryDropDown')
    this.otherCategory = page.locator('#otherCategory')
    this.isCompleteCheckBox = page.locator('#IsComplete')
    this.additionalNotes = page.locator('#AdditionalNotes')
    this.saveChangeCaseButton = page.locator('input[value="Save"]')
}

async goToAddDefendant(){
    await this.addDefButton.click();
}

async changeCaseDetails(){
    await this.changeCaseButton.click();
    await this.dropdownIsInvitationOnly.selectOption({ label: 'Yes' });
    await this.dropdownCategory.selectOption({ label: 'Other ...' });
    await this.otherCategory.fill('Test')
    await this.isCompleteCheckBox.check();
    await this.additionalNotes.fill('Test additional notes');
    await this.saveChangeCaseButton.click(); 
}}

export default CaseDetailsPage;
