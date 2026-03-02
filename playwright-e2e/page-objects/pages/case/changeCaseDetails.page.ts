import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { expect } from "../../../fixtures";

/**
 * Represents the "Change Case Details" page, allowing modification of case properties.
 * This Page Object provides locators and a method to update various details of a case,
 * such as invitation settings, category, completion status, and additional notes.
 */
class ChangeCaseDetailsPage extends Base {
  dropdownCaseIsInvitationOnly: Locator;
  isCaseCompleteCheckBox: Locator;
  additionalNotes: Locator;
  saveChangeCaseButton: Locator;
  frontPageTextFrame: Locator;
  frontPageTextArea: Locator;
  dropdownCaseProsecutedBy: Locator;
  caseUrn: Locator;

  constructor(page) {
    super(page);
    this.dropdownCaseIsInvitationOnly = page.locator("#ddIsInvitationOnly");
    this.dropdownCaseProsecutedBy = page.locator("#ddCaseProsecutedBy");
    this.caseUrn = page.locator("#txtUrn");
    this.isCaseCompleteCheckBox = page.locator("#IsComplete");
    this.additionalNotes = page.locator("#AdditionalNotes");
    this.saveChangeCaseButton = page.getByRole("button", { name: "Save" });
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
   * This method ensures the prosecution type selection is fully registered by the application before continuing.
   * It prevents failures caused by the dropdown accepting input before the underlying page logic is ready.
   */
  async selectProsecutedByCPS() {
    await expect(this.dropdownCaseProsecutedBy).toBeVisible();

    await expect
      .poll(
        async () => {
          await this.dropdownCaseProsecutedBy.selectOption({ index: 0 });
          await this.page.waitForTimeout(100);

          await this.dropdownCaseProsecutedBy.selectOption({ label: "CPS" });

          return await this.caseUrn.isEnabled();
        },
        {
          timeout: 10000,
          intervals: [500],
          message: "CPS selection not registered by application",
        },
      )
      .toBe(true);
  }
  /**
   * Fills out and submits the form to change various case details.
   */
  async changeCaseDetails(newCaseUrn) {
    await this.selectProsecutedByCPS();
    await this.caseUrn.fill(newCaseUrn.toString());
    await this.dropdownCaseIsInvitationOnly.selectOption({ label: "Yes" });
    await this.frontPageTextFrame.click();
    await this.frontPageTextArea.fill("Update Front Page");
    await this.isCaseCompleteCheckBox.check();
    await this.additionalNotes.fill("Test additional notes");
    await this.saveChangeCaseButton.click();
  }
}

export default ChangeCaseDetailsPage;
