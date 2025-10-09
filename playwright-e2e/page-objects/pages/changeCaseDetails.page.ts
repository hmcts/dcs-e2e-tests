import { Locator } from "@playwright/test";
import { Base } from "../base";

class ChangeCaseDetailsPage extends Base {
  dropdownIsInvitationOnly: Locator;
  dropdownCategory: Locator;
  otherCategory: Locator;
  isCompleteCheckBox: Locator;
  additionalNotes: Locator;
  saveChangeCaseButton: Locator;
  

constructor(page) {
    super(page);
    this.dropdownIsInvitationOnly = page.locator('#ddIsInvitationOnly')
    this.dropdownCategory = page.locator('#categoryDropDown')
    this.otherCategory = page.locator('#otherCategory')
    this.isCompleteCheckBox = page.locator('#IsComplete')
    this.additionalNotes = page.locator('#AdditionalNotes')
    this.saveChangeCaseButton = page.locator('input[value="Save"]')
}


async changeCaseDetails(){
    await this.dropdownIsInvitationOnly.selectOption({ label: 'Yes' });
    await this.dropdownCategory.selectOption({ label: 'Other ...' });
    await this.otherCategory.fill('Test')
    await this.isCompleteCheckBox.check();
    await this.additionalNotes.fill('Test additional notes');
    await this.saveChangeCaseButton.click(); 
}}

export default ChangeCaseDetailsPage;