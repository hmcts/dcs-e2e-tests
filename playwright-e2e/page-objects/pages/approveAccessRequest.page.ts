import { expect, Locator } from "@playwright/test";
import { Base } from "../base";

class AprroveAccessRequestPage extends Base {
  confirmButton: Locator;

  constructor(page) {
    super(page);
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });

}

async confirmApproval() {
    await this.confirmButton.click();
}
}
export default AprroveAccessRequestPage;