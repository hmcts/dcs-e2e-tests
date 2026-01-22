import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";

// PLEASE NOTE DUE TO LENGTHY EXECUTION TIMES INGESTION HAS NOT BEEN USED
// FOR TEST SETUP

/**
 * Represents the "Ingest Composite File" page, used for bulk uploading documents.
 * This Page Object provides locators and methods to interact with the file upload
 * form, allowing tests to upload ZIP files containing multiple sections and documents.
 */
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

  /**
   * Uploads a ZIP file containing multiple sections and documents for a given defendant.
   * Checks the defendant's checkbox, selects the ZIP file, initiates the upload,
   * and waits for the upload to complete (100% status).
   * @param {string} defendant - The name of the defendant associated with the documents.
   * @param {string} zipFile - The name of the ZIP file (without extension) located in `playwright-e2e/data/`.
   */
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
