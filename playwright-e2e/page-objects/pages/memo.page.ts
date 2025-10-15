import { Locator } from "@playwright/test";
import { Base } from "../base";

class MemoPage extends Base {
  memoLink: Locator;
  memoTextBox: Locator;
  addMemoButton: Locator;
  changeMemoButton: Locator;
  removeMemoButton: Locator;
  saveChangeMemo: Locator;
  memoHeading: Locator;
  memoText: Locator;

constructor(page) {
    super(page);
    this.memoLink = page.locator('a[title="View the memoranda for your role."]')
    this.memoTextBox = page.locator('#Text')
    this.addMemoButton = page.locator('input[value="Add Memorandum"]')
    this.changeMemoButton = page.locator('a[title="Change this memorandum."]')
    this.removeMemoButton = page.locator('a[title="Remove this memorandum from the list."]')
    this.saveChangeMemo = page.locator('input[value="Save"]')
    this.memoHeading = page.locator('div[id="content"] h3')
    this.memoText = page.locator("xpath=(//td[@class='tableText'])[1]")
}

async acceptDialog(){
    this.page.on('dialog', async dialog => {
    await dialog.accept(); 
})};

async addMemo(){
    await this.memoTextBox.fill('Add memo test')
    await this.addMemoButton.click();

}
async changeMemo(){
    await this.changeMemoButton.click();
    await this.memoTextBox.fill('Change memo test')
    await this.saveChangeMemo.click()
}

async removeMemo(){
    await this.acceptDialog();
    // Now, perform the action that opens the dialog
    await this.removeMemoButton.click()
}}
export default MemoPage;