import { Base } from "../../base";
import { Locator } from "playwright-core";

/**
 * Represents the 'Edit Hearing Date' page where you can amend
 * hearing date details, including the date, the defendants
 * attached to the hearing, and add hearing notes.
 */

class EditHearingDatePage extends Base {
  defendantCheckbox: Locator;
  saveButton: Locator;

  constructor(page) {
    super(page);
    this.defendantCheckbox = this.page.locator(".defendantCheckBox");
    this.saveButton = this.page.getByRole("button", { name: "Save" });
  }

  async addDefendantsToHearing() {
    await this.defendantCheckbox.first().check();
    await this.defendantCheckbox.nth(1).check();
    await this.saveButton.click();
  }
}

export default EditHearingDatePage;
