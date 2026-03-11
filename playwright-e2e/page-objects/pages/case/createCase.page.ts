import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { expect } from "../../../fixtures";

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
  frontPageTextFrame: Locator;
  frontPageTextArea: Locator;

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
    this.frontPageTextFrame = page
      .locator('iframe[class="tox-edit-area__iframe"]')
      .contentFrame()
      .locator("html");
    this.frontPageTextArea = page
      .locator('iframe[class="tox-edit-area__iframe"]')
      .contentFrame()
      .locator("#tinymce");
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

  async verifyUrnFieldIsDisabled() {
    await expect
      .poll(
        async () => {
          return await this.caseUrn.isDisabled();
        },
        {
          timeout: 10_000,
          message: `Case URN is not disabled`,
        },
      )
      .toBe(true);
  }

  async handleUrnField(prosecutedBy: string, newCaseUrn: string) {
    if (prosecutedBy === "CPS") {
      await expect(this.caseUrn).toBeEnabled({ timeout: 10_000 });
      await this.caseUrn.fill(newCaseUrn);
    } else {
      await this.verifyUrnFieldIsDisabled();
    }
  }

  /**
   * Fills out the form to create a new case and submits it.
   * Automatically generates unique case name and URN, selects random/specified prosecution details,
   * a default court house, and today's date for the hearing.
   * @returns {{newCaseName: string, newCaseUrn: string, prosecutedByLabel: string}} An object containing the generated new case name and URN and prosecution party.
   */
  async createNewCase(
    caseName: string,
    caseUrn: string,
    prosecutedBy?: string,
  ): Promise<{
    newCaseName: string;
    newCaseUrn: string;
    prosecutedByLabel: string;
  }> {
    const { newCaseName, newCaseUrn } = await this.generateCaseNameAndUrn(
      caseName,
      caseUrn,
    );
    await this.caseName.fill(newCaseName.toString());
    const finalProsecutedBy =
      prosecutedBy ??
      (await this.selectRandomOptionFromDropdown(
        this.dropdownCaseProsecutedBy,
      ));
    await this.dropdownCaseProsecutedBy.isEnabled();
    await this.dropdownCaseProsecutedBy.selectOption({
      label: finalProsecutedBy,
    });
    await this.handleUrnField(finalProsecutedBy, newCaseUrn);
    await this.dropdownCourtHouse.selectOption({ label: "Southwark" });
    const today = new Date();
    const date = today.getDate();
    const monthName = today.toLocaleString("default", { month: "long" });
    const year = today.getFullYear();
    await this.hearingDateDay.selectOption({ label: date.toString() });
    await this.hearingDateMonth.selectOption({ label: monthName.toString() });
    await this.hearingDateYear.selectOption({ label: year.toString() });
    await this.frontPageTextFrame.click();
    await this.frontPageTextArea.fill("Front Page Test");
    await this.createBtn.click();
    return { newCaseName, newCaseUrn, prosecutedByLabel: finalProsecutedBy };
  }
}

export default CreateCasePage;
