import { Locator } from "@playwright/test";
import { Base } from "../base";

class AddDefendantPage extends Base {
  addDefHeading: Locator;
  dOBDay: Locator;
  dOBMonth: Locator;
  dOBYear: Locator;
  defSurName: Locator;
  defFirstName: Locator;
  defUrn: Locator;
  addBtn: Locator;

constructor(page) {
    super(page);
    this.addDefHeading = page.locator("xpath= //div[@id='content']//h2[1]")
    this.dOBDay = page.locator('#DobDay');
    this.dOBMonth = page.locator('#DobMonth');
    this.dOBYear = page.locator('#DobYear');
    this.defSurName = page.locator('#Surname');
    this.defFirstName = page.locator('#FirstName');
    this.defUrn = page.locator('#Urn')
    this.addBtn = page.locator('#add-p')

}

async addDefendant(surName: string, dOBMonth: string,caseUrn: string){
    await this.defSurName.fill(surName);
    await this.defFirstName.fill("Defendant");
    await this.dOBDay.selectOption("1");
    await this.dOBMonth.selectOption(dOBMonth);
    await this.dOBYear.selectOption("1990");
    if (await this.defUrn.isEnabled()) {
    await this.defUrn.fill(caseUrn);
    } else {
    console.log('URN Text box is disabled as case is not prosecuted by CPS');
    }
    await this.addBtn.click();
}}

export default AddDefendantPage;







