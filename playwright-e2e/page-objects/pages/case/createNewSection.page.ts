import { Locator } from "@playwright/test";
import { Base } from "../../base";

/**
 * Represents the "Create New Section" page, allowing the creation of new document sections
 * within a case.
 * This Page Object provides locators and methods to define properties for a new section,
 * such as its number, name, and order, and to submit the creation request.
 */
class createNewSectionPage extends Base {
  sectionNumber: Locator;
  sectionTitle: Locator;
  sectionOrder: Locator;
  createSectionButton: Locator;

  constructor(page) {
    super(page);
    this.sectionNumber = page.locator("#Index");
    this.sectionTitle = page.locator("#Name");
    this.sectionOrder = page.locator("#SectionOrder");
    this.createSectionButton = page.getByRole("button", { name: "Create" });
  }

  /**
   * Creates a new private section with the given defendant and section number.
   * @param {string} defendant - The name of the defendant to associate with the private section.
   * @param {string} sectionNumber - The letter/s and/or number/s for the new section (eg. 'PD1'),
   * called 'Section Number' in the platform.
   */
  async createPrivateSection(defendant: string, sectionNumber: string) {
    await this.sectionNumber.fill(sectionNumber);
    await this.sectionTitle.fill("Private -" + defendant);
    await this.sectionOrder.fill(sectionNumber);
    await this.createSectionButton.click();
  }
}
export default createNewSectionPage;
