import { Locator } from "playwright-core";
import { Base } from "../base";

class UploadDocumentPage extends Base {
  startUploadBtn: Locator;
  viewSectionDocsBtn: Locator;
  fileInput: Locator;

  constructor(page) {
    super(page);
    this.startUploadBtn = page.locator("#uploader_start");
    this.viewSectionDocsBtn = page.getByRole("link", {
      name: "View Section Documents",
    });
    this.fileInput = page.locator('input[type="file"]');
  }

  async uploadUnrestrictedDocument(filename: string) {
    await this.fileInput.waitFor();
    await this.fileInput.setInputFiles(`playwright-e2e/data/${filename}.pdf`);
    await this.startUploadBtn.click();
    await this.viewSectionDocsBtn.click();
  }

  async uploadRestrictedSectionDocument(defendant: string, filename: string) {
    const defendantCheckbox = this.page.getByRole("checkbox", {
      name: `${defendant}`,
    });
    if (!(await defendantCheckbox.isChecked())) {
      await defendantCheckbox.check();
    }
    await this.fileInput.waitFor();
    await this.fileInput.setInputFiles(`playwright-e2e/data/${filename}.pdf`);
    await this.startUploadBtn.click();
    await this.viewSectionDocsBtn.click();
  }
}

export default UploadDocumentPage;
