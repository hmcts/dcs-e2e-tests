import { Locator } from "@playwright/test";
import { Base } from "../../base";

/**
 * Represents the "Change Case Details" page, allowing modification of case properties.
 * This Page Object provides locators and a method to update various details of a case,
 * such as invitation settings, category, completion status, and additional notes.
 */
class ChangeCaseDetailsPage extends Base {
  dropdownCaseIsInvitationOnly: Locator;
  dropdownCategory: Locator;
  otherCategory: Locator;
  isCaseCompleteCheckBox: Locator;
  additionalNotes: Locator;
  saveChangeCaseButton: Locator;

  constructor(page) {
    super(page);
    this.dropdownCaseIsInvitationOnly = page.locator("#ddIsInvitationOnly");
    this.dropdownCategory = page.locator("#categoryDropDown");
    this.otherCategory = page.locator("#otherCategory");
    this.isCaseCompleteCheckBox = page.locator("#IsComplete");
    this.additionalNotes = page.locator("#AdditionalNotes");
    this.saveChangeCaseButton = page.getByRole("button", { name: "Save" });
  }

  /**
   * Fills out and submits the form to change various case details.
   * This method sets specific values for "Case Is Invitation Only", "Category",
   * "Case Is Complete", and "Additional Notes".
   */
  async changeCaseDetails() {
    await this.dropdownCaseIsInvitationOnly.selectOption({ label: "Yes" });
    await this.dropdownCategory.selectOption({ label: "Other ..." });
    await this.otherCategory.fill("Test");
    await this.isCaseCompleteCheckBox.check();
    await this.additionalNotes.fill("Test additional notes");
    await this.saveChangeCaseButton.click();
  }
}

export default ChangeCaseDetailsPage;
