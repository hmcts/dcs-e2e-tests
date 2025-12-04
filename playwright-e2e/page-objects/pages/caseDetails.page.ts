import { Locator } from "@playwright/test";
import { Base } from "../base";
import { waitUntilClickable } from "../../utils";

class CaseDetailsPage extends Base {
  caseNameHeading: Locator;
  caseDetailsHeading: Locator;
  addDefButton: Locator;
  changeCaseButton: Locator;
  nameDefOne: Locator;
  nameDefTwo: Locator;
  verifyAdditionalNotes: Locator;
  removeCaseBtn: Locator;

  constructor(page) {
    super(page);
    this.caseNameHeading = page.locator(".heading-medium");
    this.caseDetailsHeading = page.locator("legend.heading-small");
    this.addDefButton = page.getByRole("link", { name: "Add Defendant" });
    this.changeCaseButton = page
      .getByRole("link", { name: "Change Case Details" })
      .first();
    this.nameDefOne = page.getByRole("cell", {
      name: "Defendant One",
      exact: true,
    });
    this.nameDefTwo = page.getByRole("cell", {
      name: "Defendant Two",
      exact: true,
    });
    this.verifyAdditionalNotes = page.getByRole("cell", {
      name: "Test additional notes",
    });
    this.removeCaseBtn = page.getByRole("link", { name: "Remove Case" });
  }

  async goToAddDefendant() {
    await this.addDefButton.click();
  }

  async goToChangeCaseDetails() {
    await this.changeCaseButton.click();
  }

  async removeCase(timeoutMs = 10000) {
    try {
      // First dialog
      const firstDialogPromise = this.page.waitForEvent("dialog", {
        timeout: timeoutMs,
      });
      await waitUntilClickable(this.removeCaseBtn);
      await this.removeCaseBtn.click();
      const firstDialog = await firstDialogPromise;
      await firstDialog
        .accept()
        .catch((err) => console.warn("⚠️ Failed to accept first dialog:", err));
    } catch (err) {
      console.warn("⚠️ First dialog did not appear or failed:", err);
      return; // stop further attempts if first dialog fails
    }

    try {
      // Second dialog
      const secondDialogPromise = this.page.waitForEvent("dialog", {
        timeout: timeoutMs,
      });
      const secondDialog = await secondDialogPromise;
      await secondDialog
        .accept()
        .catch((err) =>
          console.warn("⚠️ Failed to accept second dialog:", err)
        );
    } catch (err) {
      console.warn("⚠️ Failed to accept second dialog:", err);
    }
  }
}

export default CaseDetailsPage;
