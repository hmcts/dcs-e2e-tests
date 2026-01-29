import { Locator } from "playwright-core";
import { Base } from "../../base";
import { waitUntilClickable } from "../../../utils";
import { expect } from "../../../fixtures";

/**
 * Represents the "Update All Documents" page, allowing users to perform bulk actions
 * on documents within a section. This Page Object provides functionalities to remove,
 * move to another section, or edit the title of existing documents.
 */
class UpdateDocumentsPage extends Base {
  updateHeading: Locator;
  removeBtn: Locator;
  moveBtn: Locator;
  confirmMoveBtn: Locator;
  documentTitle: Locator;
  sectionDocumentsBtn: Locator;
  loadingIndicator: Locator;

  constructor(page) {
    super(page);
    this.updateHeading = page.getByRole("heading", {
      name: "Update All Documents",
      level: 3,
    });
    this.removeBtn = page.getByRole("link", {
      name: "Remove",
    });
    this.moveBtn = page.getByRole("link", {
      name: "Move",
      exact: true,
    });
    this.documentTitle = this.page.locator(`textarea.userInput[id*="name"]`);
    this.confirmMoveBtn = page.locator("a[href^='javascript:moveDocument']");
    this.sectionDocumentsBtn = page.locator(".button-level-one", {
      name: "Documents",
    });
    this.loadingIndicator = this.page.getByRole("img", { name: "working" });
  }

  /**
   * Removes a document from the section.
   * Clicks the "Remove" button and accepts the confirmation dialog.
   */
  async removeDocument() {
    await waitUntilClickable(this.removeBtn);

    const clickAndWaitForDialog = async () => {
      const dialogPromise = this.page.waitForEvent("dialog", { timeout: 2000 });
      await this.removeBtn.click();
      return dialogPromise;
    };

    try {
      let dialog;

      try {
        dialog = await clickAndWaitForDialog();
      } catch {
        // Dialog didn’t appear – retry once
        await this.removeBtn.click();
        dialog = await this.page.waitForEvent("dialog");
      }

      await dialog.accept({ timeout: 30000 });
      console.log("Dialog accepted - remove document");
    } catch (error) {
      console.log("Issue accepting document deletion dialog", error);
    }
  }

  /**
   * Moves a document to a new, randomly selected section.
   * This method ensures the new section is not one of the already used or specified new sections.
   * @returns The name of the randomly selected new section.
   */
  async moveDocument(sectionKeys: [string, string][], newSections: string[]) {
    const availableSections = ["A", "B", "C", "D", "E"].filter(
      (section) =>
        !sectionKeys.some(([usedSection]) => usedSection === section) &&
        !newSections.includes(section),
    );

    const randomSection =
      availableSections[Math.floor(Math.random() * availableSections.length)];

    newSections.push(randomSection.toString());

    const labelMap: Record<string, string> = {
      A: "A: Magistrates Sending Sheet",
      B: "B: Indictment",
      C: "C: Basis of Plea",
      D: "D: Defence Statement",
      E: "E: Charges",
    };

    await this.moveBtn.first().click();
    await this.page.selectOption("#sectionSelect", {
      label: labelMap[randomSection],
    });
    await this.confirmMoveBtn.click();
    return randomSection;
  }

  /**
   * Edits the title of a document.
   * Fills the `documentTitle` text area with "TestEdit" and waits for any loading indicators to disappear.
   */
  async editDocumentName() {
    await this.documentTitle.focus();
    await this.documentTitle.fill("TestEdit");
    await this.documentTitle.press("Tab");
    const loading = this.loadingIndicator;
    try {
      await loading.waitFor({ state: "visible", timeout: 15000 });
      // Wait for it to disappear
      await loading.waitFor({ state: "hidden", timeout: 30000 });
    } catch {
      console.warn("⚠️ Loader did not appear");
    }
    await expect(this.documentTitle).toHaveValue("TestEdit", {
      timeout: 30000,
    });
  }
}

export default UpdateDocumentsPage;
