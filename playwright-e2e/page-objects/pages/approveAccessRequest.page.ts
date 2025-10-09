import { expect, Locator } from "@playwright/test";
import { Base } from "../base";

class AprroveAccessRequestPage extends Base {
  confirmButton: Locator;
  approveRequestHeading: Locator;

  constructor(page) {
    super(page);
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.approveRequestHeading = page.locator('div#content h2')

}

async confirmApproval() {
    await this.confirmButton.click();
}
}
export default AprroveAccessRequestPage;