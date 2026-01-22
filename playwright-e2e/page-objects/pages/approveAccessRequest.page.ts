import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

/**
 * Represents the "Approve Access Request" confirmation page.
 * This Page Object provides locators and methods to confirm the approval
 * of a user's access request.
 */
class ApproveAccessRequestPage extends Base {
  confirmButton: Locator;
  approveRequestHeading: Locator;

  constructor(page) {
    super(page);
    this.confirmButton = page.getByRole("button", { name: "Confirm" });
    this.approveRequestHeading = page.locator("div#content h2");
  }

  /**
   * Confirms the approval of a user's access request.
   */
  async approveUserRequest() {
    await expect(this.approveRequestHeading).toHaveText(
      "Approve Access Request"
    );
    await this.confirmButton.click();
  }
}
export default ApproveAccessRequestPage;
