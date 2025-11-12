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
    await this.fileInput.setInputFiles(`playwright-e2e/data/${filename}.pdf`);
    await this.startUploadBtn.click();
    await this.viewSectionDocsBtn.click();
  }

  async uploadRestrictedSectionDocument(
    primaryDefendant: string,
    filename: string,
    additionalDefendant?: string
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
