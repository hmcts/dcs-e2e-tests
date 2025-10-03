import { Locator } from "@playwright/test";
import { Base } from "../base";

class CaseDetailsPage extends Base {
  caseNameHeading: Locator;
  caseDetailsHeading: Locator;
  addDefBtn: Locator;
  dOBDay: Locator;
  dOBMonth: Locator;
  dOBYear: Locator;
  surName: Locator;
  firstName: Locator;
  roleSelect: Locator;
  defUrn: Locator;
  defOne: Locator;
  defTwo: Locator;
  addBtn: Locator;
  FpgBtn: Locator;
  changeCaseBtn: Locator;
  dropdownIsInvitationOnly: Locator;
  dropdownCategory: Locator;
  otherCategory: Locator;
  isCompleteCheckBox: Locator;
  additionalNotes: Locator;
  saveChangeCaseBtn: Locator;
  

constructor(page) {
    super(page);
    this.caseNameHeading = page.locator(".heading-medium");
    this.caseDetailsHeading = page.locator("legend.heading-small");
    this.addDefBtn = page.getByRole("link", {name: "Add Defendant"});
    this.dOBDay = page.locator('#DobDay');
    this.dOBMonth = page.locator('#DobMonth');
    this.dOBYear = page.locator('#DobYear');
    this.surName = page.locator('#Surname');
    this.firstName = page.locator('#FirstName');
    this.roleSelect = page.locator('[name="roleSelector"]')
    this.defOne = page.locator('[name="Defendant One  - 01.01.70"]')
    this.defTwo = page.locator('[name="Defendant Two  - 01.02.70"]')
    this.defUrn = page.locator('#Urn')
    this.addBtn = page.locator('#add-p')
    this.FpgBtn = page.getByRole('button', {name:"Back to Front Page"})
    this.changeCaseBtn = page.locator("xpath=(//a[@class='button-level-one'])[1]")
    this.dropdownIsInvitationOnly = page.locator('#ddIsInvitationOnly')
    this.dropdownCategory = page.locator('#categoryDropDown')
    this.otherCategory = page.locator('#otherCategory')
    this.isCompleteCheckBox = page.locator('#IsComplete')
    this.additionalNotes = page.locator('#AdditionalNotes')
    this.saveChangeCaseBtn = page.locator('input[value="Save"]')
}

async addDefendants(surName: string, dOBMonth: string,caseUrn: string){
    await this.addDefBtn.click();
    await this.firstName.fill("Defendant");
    await this.surName.fill(surName.toString());
    await this.dOBDay.selectOption("1");
    await this.dOBMonth.selectOption(dOBMonth.toString());
    await this.dOBYear.selectOption("1990");
    if (await this.defUrn.isEnabled()) {
    await this.defUrn.fill(caseUrn);
    } else {
    console.log('Text box is disabled, skipping fill action.');
    }
    await this.addBtn.click();
}

async changeCaseDetails(){
    await this.changeCaseBtn.click();
    await this.dropdownIsInvitationOnly.selectOption({ label: 'Yes' });
    await this.dropdownCategory.selectOption({ label: 'Other ...' });
    await this.otherCategory.fill('Test')
    await this.isCompleteCheckBox.check();
    await this.additionalNotes.fill('Test additional notes');
    await this.saveChangeCaseBtn.click(); 
}}

export default CaseDetailsPage;
