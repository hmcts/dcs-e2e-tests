import { Locator } from "@playwright/test";
import { Base } from "../base";

class CreateCasePage extends Base {
  caseName: Locator;
  dropdownCaseProsecutedBy: Locator;
  caseUrn: Locator;
  dropdownCourtHouse: Locator;
  hearingDateDay: Locator;
  hearingDateMonth: Locator;
  hearingDateYear: Locator;  
  frontPgDesc: Locator;
  submitCreateBtn: Locator;
  
constructor(page) {
    super(page);
    this.caseName = page.locator('#Name');
    this.dropdownCaseProsecutedBy = page.locator('#ddCaseProsecutedBy')
    this.caseUrn =  page.locator('#txtUrn');
    this.dropdownCourtHouse =  page.locator('#CourtHouse');
    this.hearingDateDay =  page.locator('#HearingDateDay');
    this.hearingDateMonth =  page.locator('#HearingDateMonth');
    this.hearingDateYear =  page.locator('#HearingDateYear');
    this.frontPgDesc =  page.locator('#Description_ifr');
    this.submitCreateBtn =  page.locator("//input[@value='Create']");

}

async generateCaseNameAndUrn (caseName: string, caseUrn: string){
    const randomNumber = Math.floor(Math.random() * 10000) + 1000;
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
}}

export default CreateCasePage;



