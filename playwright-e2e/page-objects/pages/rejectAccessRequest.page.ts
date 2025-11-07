import { Locator } from "@playwright/test";
import { Base } from "../base";

class RejectAccessRequestPage extends Base {
  confirmButton: Locator;
  rejectRequestHeading: Locator;

  constructor(page) {
    super(page);
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.rejectRequestHeading = page.locator('div#content h2')

}
async confirmReject() {
    await this.confirmButton.click();

}

}
export default RejectAccessRequestPage;
