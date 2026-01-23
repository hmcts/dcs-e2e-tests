import { Locator } from "playwright-core";
import { Base } from "../../base";

/**
 * Represents the document upload page within a case section.
 * This Page Object provides functionalities for selecting files,
 * initiating uploads, and specifying access restrictions for documents,
 * particularly for linking restricted documents to specific defendants.
 */
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

  /**
   * Uploads an unrestricted document (PDF) to the current section.
   */
  async uploadUnrestrictedDocument(filename: string) {
    await this.fileInput.setInputFiles(`playwright-e2e/data/${filename}.pdf`);
    await this.startUploadBtn.click();
    await this.viewSectionDocsBtn.click();
  }

  /**
   * Uploads a restricted document (PDF) to the current section and associates it
   * with one or more defendants.
   * @param primaryDefendant - The name of the primary defendant to associate the document with.
   * @param filename - The name of the PDF file (without extension) located in `playwright-e2e/data/`.
   * @param [additionalDefendant] - Optional, the name of an additional defendant to associate the document with.
   */
  async uploadRestrictedSectionDocument(
    primaryDefendant: string,
    filename: string,
    additionalDefendant?: string,
  ) {
    const primaryDefendantCheckbox = this.page.getByRole("checkbox", {
      name: `${primaryDefendant}`,
    });
    if (!(await primaryDefendantCheckbox.isChecked())) {
      await primaryDefendantCheckbox.check();
    }

    if (additionalDefendant) {
      const additionalDefendantCheckbox = this.page.getByRole("checkbox", {
        name: additionalDefendant,
      });
      if (!(await additionalDefendantCheckbox.isChecked())) {
        await additionalDefendantCheckbox.check();
      }
    }

    await this.fileInput.waitFor();
    await this.fileInput.setInputFiles(`playwright-e2e/data/${filename}.pdf`);
    await this.startUploadBtn.click();
    await this.viewSectionDocsBtn.click();
  }
}

export default UploadDocumentPage;
