import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

/**
 * Represents the "Reject Access Request" confirmation page.
 * This Page Object provides locators and methods to confirm the rejection
 * of a user's access request.
 */
class RejectAccessRequestPage extends Base {
  confirmButton: Locator;
  rejectRequestHeading: Locator;

  constructor(page) {
    super(page);
    this.confirmButton = page.getByRole("button", { name: "Confirm" });
    this.rejectRequestHeading = page.locator("div#content h2");
  }

  async rejectUserRequest() {
    await expect(this.rejectRequestHeading).toHaveText("Reject Access Request");
    await this.confirmButton.click();
  }
}
export default RejectAccessRequestPage;
