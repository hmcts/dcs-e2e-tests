import { Locator } from "@playwright/test";
import { Base } from "../base";

class AddDefendantsPage extends Base {
  addDefHeading: Locator;
  dOBDay: Locator;
  dOBMonth: Locator;
  dOBYear: Locator;
  defSurName: Locator;
  defFirstName: Locator;
  roleSelect: Locator;
  defUrn: Locator;
  defOne: Locator;
  defTwo: Locator;
  addBtn: Locator;
  FpgBtn: Locator;


constructor(page) {
    super(page);
    this.addDefHeading = page.locator("xpath= //div[@id='content']//h2[1]")
    this.dOBDay = page.locator('#DobDay');
    this.dOBMonth = page.locator('#DobMonth');
    this.dOBYear = page.locator('#DobYear');
    this.defSurName = page.locator('#Surname');
    this.defFirstName = page.locator('#FirstName');
    this.roleSelect = page.locator('[name="roleSelector"]')
    this.defOne = page.locator('[name="Defendant One  - 01.01.70"]')
    this.defTwo = page.locator('[name="Defendant Two  - 01.02.70"]')
    this.defUrn = page.locator('#Urn')
    this.addBtn = page.locator('#add-p')
    this.FpgBtn = page.getByRole('button', {name:"Back to Front Page"})

}

async addDefendants(surName: string, dOBMonth: string,caseUrn: string){
    await this.defFirstName.fill("Defendant");
    await this.defSurName.fill(surName.toString());
    await this.dOBDay.selectOption("1");
    await this.dOBMonth.selectOption(dOBMonth.toString());
    await this.dOBYear.selectOption("1990");
    if (await this.defUrn.isEnabled()) {
    await this.defUrn.fill(caseUrn);
    } else {
    console.log('Text box is disabled, skipping fill action.');
    }
    await this.addBtn.click();
}}

export default AddDefendantsPage;







