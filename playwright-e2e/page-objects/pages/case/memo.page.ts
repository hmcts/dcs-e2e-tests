import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { expect } from "../../../fixtures";

/**
 * Represents the "Memos" page within a case, where users can create, edit,
 * and delete memoranda. This Page Object provides locators and methods
 * to interact with memo functionalities.
 */
class MemoPage extends Base {
  memoTextBox: Locator;
  addMemoButton: Locator;
  addMemoLink: Locator;
  changeMemoButton: Locator;
  removeMemoButton: Locator;
  saveChangeMemo: Locator;
  memoHeading: Locator;
  memoTable: Locator;

  constructor(page) {
    super(page);
    this.memoTextBox = page.locator("#Text");
    this.addMemoButton = page.getByRole("button", { name: "Add Memorandum" });
    this.addMemoLink = page.getByRole("link", { name: "Add a Memorandum" });
    this.changeMemoButton = page.getByRole("link", { name: "Change" }).first();
    this.removeMemoButton = page.getByRole("link", { name: "Remove" }).first();
    this.saveChangeMemo = page.getByRole("button", { name: "Save" });
    this.memoHeading = page.locator('div[id="content"] h3');
    this.memoTable = page.locator("table.formTable-zebra");
  }

  /**
   * Adds a new memo to the case. It handles two possible UI states:
   * either the memo text box is directly visible (first memo), or it needs to be
   * revealed by clicking an "Add a Memorandum" link.
   */
  async addMemo(user: string) {
    if (await this.memoTextBox.isVisible()) {
      await this.memoTextBox.fill(
        `${user} memo test textbox directly available`,
      );
      await this.addMemoButton.click();
    } else {
      await this.addMemoLink.click();
      await this.memoTextBox.fill(
        `${user} memo test via Add a Memorandum button`,
      );
      await this.addMemoButton.click();
    }
  }

  getMemoRowByText(text: string) {
    return this.memoTable.locator("tr", {
      has: this.page.locator("td.tableText", { hasText: text }),
    });
  }
  /**
   * Changes an existing memo. Clicks the "Change" button, updates the memo text,
   * and saves the changes.
   */
  async changeMemo() {
    await this.changeMemoButton.click();
    await this.memoTextBox.fill("Change memo test");
    await this.saveChangeMemo.click();
  }

  /**
   * Removes an existing memo. Clicks the "Remove" button and accepts the
   * confirmation dialog. Includes error handling for dialog acceptance.
   */
  async removeMemo() {
    try {
      const dialogPromise = this.page.waitForEvent("dialog");
      await this.removeMemoButton.click();
      const dialog = await dialogPromise;
      await dialog.accept();
      console.log("Dialog accepted");
    } catch {
      console.log("Issue accepting memo deletion dialog");
    }
  }

  /**
   * Validates the number of memos in the memos table against an expected count
   */
  async expectMemoCount(count: number) {
    const rows = this.memoTable.locator("tbody tr:has(td.tableText)");
    await expect(rows).toHaveCount(count, { timeout: 30000 });
  }
}
export default MemoPage;
