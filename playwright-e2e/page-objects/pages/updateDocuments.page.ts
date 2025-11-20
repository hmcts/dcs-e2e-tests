import { Locator } from "playwright-core";
import { Base } from "../base";

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

  async removeDocument() {
    const dialogPromise = this.page.waitForEvent("dialog");
    await this.removeBtn.click();
    const dialog = await dialogPromise;
    try {
      await dialog.accept();
    } catch (err) {
      console.warn("⚠️ Failed to accept document deletion dialog:", err);
    }
  }

  async moveDocument(sectionKeys: [string, string][], newSections: string[]) {
    const availableSections = ["A", "B", "C", "D", "E"].filter(
      (section) =>
        !sectionKeys.some(([usedSection]) => usedSection === section) &&
        !newSections.includes(section)
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
  }
}

export default UpdateDocumentsPage;
