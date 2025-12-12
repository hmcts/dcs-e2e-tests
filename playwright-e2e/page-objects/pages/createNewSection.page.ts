import { Locator } from "@playwright/test";
import { Base } from "../base";

class createNewSectionPage extends Base {
  sectionNumber : Locator;
  sectionName : Locator;
  sectionOrder : Locator;
  createSectionButton : Locator;

  constructor(page) {
    super(page);
    this.sectionNumber = page.locator('#Index')
    this.sectionName  = page.locator('#Name')
    this.sectionOrder  = page.locator('#SectionOrder')
    this.createSectionButton = page.getByRole("button", { name: "Create" });
  }

  async createPrivateSection(defendant: string, sectionNumber: string){
      await this.sectionNumber.fill(sectionNumber)
      await this.sectionName.fill('Private -'+defendant)
      await this.sectionOrder.fill(sectionNumber)
      await this.createSectionButton.click()
  }

}
export default createNewSectionPage;
