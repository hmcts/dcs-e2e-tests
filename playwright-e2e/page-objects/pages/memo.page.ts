import { Locator } from "@playwright/test";
import { Base } from "../base";

class MemoPage extends Base {
  memoLink: Locator;
  updateMemo: Locator;
  memoText: Locator;
  addMemo: Locator;
  changeMemo: Locator;
  removeMemo: Locator;
  saveChangeMemo: Locator;
  memoHeading: Locator;

constructor(page) {
    super(page);
    this.memoLink = page.locator('a[title="View the memoranda for your role."]')
    this.updateMemo = page.getByRole('link', { name: 'Update Memoranda' })
    this.memoText = page.locator('#Text')
    this.addMemo = page.locator('input[value="Add Memorandum"]')
    this.changeMemo = page.locator('a[title="Change this memorandum."]')
    this.removeMemo = page.locator('a[title="Remove this memorandum from the list."]')
    this.saveChangeMemo = page.locator('input[value="Save"]')
    this.memoHeading = page.locator('div[id="content"] h3')
}

async acceptDialog(){
    this.page.on('dialog', async dialog => {
    await dialog.accept(); // Confirms the action
})};

async addAndUpdateMemo(){
    await this.memoLink.click();
    await this.memoText.fill('Test add memo')
    await this.addMemo.click();
    await this.changeMemo.click();
    await this.memoText.fill('Test change & remove memo')
    await this.saveChangeMemo.click()
    await this.acceptDialog();
    // Now, perform the action that opens the dialog
    await this.removeMemo.click()
    await this.memoText.fill('Tested Memo functionality')
    await this.addMemo.click();

}}
export default MemoPage;