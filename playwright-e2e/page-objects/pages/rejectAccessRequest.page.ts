import { expect, Locator } from "@playwright/test";
import { Base } from "../base";

class RejectAccessRequestPage extends Base {
  confirmButton: Locator;

  constructor(page) {
    super(page);
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });

}
async confirmReject() {
    await this.confirmButton.click();

}

}
export default RejectAccessRequestPage;
