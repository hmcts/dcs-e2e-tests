import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

class ApproveAccessRequestPage extends Base {
  confirmButton: Locator;
  approveRequestHeading: Locator;

  constructor(page) {
    super(page);
    this.confirmButton = page.getByRole("button", { name: "Confirm" });
    this.approveRequestHeading = page.locator("div#content h2");
  }

  async approveUserRequest() {
    await expect(this.approveRequestHeading).toHaveText(
      "Approve Access Request"
    );
    await this.confirmButton.click();
  }
}
export default ApproveAccessRequestPage;
