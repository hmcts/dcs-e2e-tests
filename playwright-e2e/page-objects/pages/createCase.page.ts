import { Locator } from "@playwright/test";
import { Base } from "../base";

class CreateCasePage extends Base {
  createCaseLink: Locator;
  caseName: Locator;
  caseUrn: Locator;
  dropdownCourtHouse: Locator;
  hearingDateDay: Locator;
  hearingDateMonth: Locator;
  hearingDateYear: Locator;  
  frontPgDesc: Locator;
  submitCreateBtn: Locator;
  dropdownCaseProsecutedBy: Locator;
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
    this.createCaseLink = page.getByRole("link", { name: "Create a Case" });
    this.caseName = page.locator('#Name');
    this.dropdownCaseProsecutedBy = page.locator('#ddCaseProsecutedBy')
    this.caseUrn =  page.locator('#txtUrn');
    this.dropdownCourtHouse =  page.locator('#CourtHouse');
    this.hearingDateDay =  page.locator('#HearingDateDay');
    this.hearingDateMonth =  page.locator('#HearingDateMonth');
    this.hearingDateYear =  page.locator('#HearingDateYear');
    this.frontPgDesc =  page.locator('#Description_ifr');
    this.submitCreateBtn =  page.locator("//input[@value='Create']");
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

async generateCaseNameAndUrn (caseName: string, caseUrn: string){
    const randomNumber = Math.floor(Math.random() * 10000) + 100;
    const caseRandom = caseName+randomNumber;
    const urnRandom = caseUrn+randomNumber;
    console.log(caseRandom);
    return {caseRandom, urnRandom};
}

// Move this function in a utility or a base page class
async  selectRandomOptionFromDropdown(dropdown: Locator): Promise<string> {
    const labels = await dropdown.locator('option').allTextContents();
    const valid = labels.filter(l => l.trim() !== '');
    if (valid.length === 0) {
        throw new Error('No valid options found in the dropdown.');
    }
    const randomIndex = Math.floor(Math.random() * valid.length);
    const randomLabel = valid[randomIndex];
    await dropdown.selectOption({ label: randomLabel });
    console.log(`Selected option: ${randomLabel}`);
    return randomLabel;
}

async createNewCase(caseName: string, caseUrn: string) {
    const {caseRandom, urnRandom} = await this.generateCaseNameAndUrn(caseName,caseUrn);
    await this.caseName.fill(caseRandom.toString());
    await this.caseUrn.fill(urnRandom.toString());
    const label = await this.selectRandomOptionFromDropdown(this.dropdownCaseProsecutedBy);
    await this.dropdownCaseProsecutedBy.selectOption({ label });
    await this.dropdownCourtHouse.selectOption({ label: 'Southwark' });
    const today = new Date();
    const date = today.getDate();
    const monthName = today.toLocaleString('default', {month : 'long' });
    const year = today.getFullYear();
    await this.hearingDateDay.selectOption({ label: date.toString() });
    await this.hearingDateMonth.selectOption({ label: monthName.toString() });
    await this.hearingDateYear.selectOption({ label: year.toString() });
    await this.submitCreateBtn.click();
    return caseUrn;
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
}
}

export default CreateCasePage;



