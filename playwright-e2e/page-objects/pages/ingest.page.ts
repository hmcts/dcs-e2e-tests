import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";

class IngestPage extends Base {
  ingestHeading: Locator;
  fileInput: Locator;
  startUploadBtn: Locator;
  uploadStatus: Locator;

  constructor(page) {
    super(page);
    this.ingestHeading = page.getByText("Ingest Composite File");
    this.fileInput = page.locator('input[type="file"]');
    this.startUploadBtn = page.locator("#uploader_start");
    this.uploadStatus = page.locator(".plupload_file_percent");
  }

  async uploadBulkSectionsDocuments(defendant: string, zipFile: string) {
    const defendantCheckbox = this.page.getByRole("checkbox", {
      name: `${defendant}`,
    });
    if (!(await defendantCheckbox.isChecked())) {
      await defendantCheckbox.check();
    }
    await this.fileInput.waitFor();
    await this.fileInput.setInputFiles(`playwright-e2e/data/${zipFile}.zip`);
    await this.startUploadBtn.click();
    await expect(this.uploadStatus).toHaveText("100%");
  }
}
export default IngestPage;
