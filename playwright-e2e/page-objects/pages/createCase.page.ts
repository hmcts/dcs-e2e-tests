import { Locator } from "@playwright/test";
import { Base } from "../base";

/**
 * Represents the "Create Case" page, used for initiating a new case in the application.
 * This Page Object provides locators and methods to fill out the new case form,
 * including case details, prosecution information, court details, and hearing dates.
 */
class CreateCasePage extends Base {
  caseName: Locator;
  dropdownCaseProsecutedBy: Locator;
  caseUrn: Locator;
  dropdownCourtHouse: Locator;
  hearingDateDay: Locator;
  hearingDateMonth: Locator;
  hearingDateYear: Locator;
  frontPgDesc: Locator;
  createBtn: Locator;

  constructor(page) {
    super(page);
    this.caseName = page.locator("#Name");
    this.dropdownCaseProsecutedBy = page.locator("#ddCaseProsecutedBy");
    this.caseUrn = page.locator("#txtUrn");
    this.dropdownCourtHouse = page.locator("#CourtHouse");
    this.hearingDateDay = page.locator("#HearingDateDay");
    this.hearingDateMonth = page.locator("#HearingDateMonth");
    this.hearingDateYear = page.locator("#HearingDateYear");
    this.frontPgDesc = page.locator("#Description_ifr");
    this.createBtn = page.getByRole("button", { name: "Create" });
  }

  /**
   * Generates a unique case name and URN by appending a random number to the base names.
   * @param {string} caseName - The base case name.
   * @param {string} caseUrn - The base case URN.
   * @returns {{newCaseName: string, newCaseUrn: string}} An object containing the generated unique case name and URN.
   */
  async generateCaseNameAndUrn(caseName: string, caseUrn: string) {
    const randomNumber = Math.floor(Math.random() * 10000) + 1000;
    const newCaseName = caseName + randomNumber;
    const newCaseUrn = caseUrn + randomNumber;
    console.log(newCaseName);
    return { newCaseName, newCaseUrn };
  }

  /**
   * Selects a random valid option from a given dropdown locator.
   * @returns {Promise<string>} A Promise that resolves to the label of the randomly selected option.
   */
  async selectRandomOptionFromDropdown(dropdown: Locator): Promise<string> {
    const labels = await dropdown.locator("option").allTextContents();
    const valid = labels.filter((l) => l.trim() !== "");
    if (valid.length === 0) {
      throw new Error("No valid options found in the dropdown.");
    }
    const randomIndex = Math.floor(Math.random() * valid.length);
    const randomLabel = valid[randomIndex];
    console.log(`Selected option: ${randomLabel}`);
    return randomLabel;
  }

  /**
   * Fills out the form to create a new case and submits it.
   * Automatically generates unique case name and URN, selects random/specified prosecution details,
   * a default court house, and today's date for the hearing.
   * @returns {{newCaseName: string, newCaseUrn: string}} An object containing the generated new case name and URN.
   */
  async createNewCase(
    caseName: string,
    caseUrn: string,
    prosecutedBy?: string,
  ): Promise<{ newCaseName: string; newCaseUrn: string }> {
    const { newCaseName, newCaseUrn } = await this.generateCaseNameAndUrn(
      caseName,
      caseUrn,
    );
    await this.caseName.fill(newCaseName.toString());
    await this.caseUrn.fill(newCaseUrn.toString());
    const label = await this.selectRandomOptionFromDropdown(
      this.dropdownCaseProsecutedBy,
    );
    if (prosecutedBy) {
      await this.dropdownCaseProsecutedBy.selectOption({ label: prosecutedBy });
    } else {
      await this.dropdownCaseProsecutedBy.selectOption({ label });
    }
    await this.dropdownCourtHouse.selectOption({ label: "Southwark" });
    const today = new Date();
    const date = today.getDate();
    const monthName = today.toLocaleString("default", { month: "long" });
    const year = today.getFullYear();
    await this.hearingDateDay.selectOption({ label: date.toString() });
    await this.hearingDateMonth.selectOption({ label: monthName.toString() });
    await this.hearingDateYear.selectOption({ label: year.toString() });
    await this.createBtn.click();
    return { newCaseName, newCaseUrn };
  }
}

export default CreateCasePage;
