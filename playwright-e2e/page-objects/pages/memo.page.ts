import { Locator } from "@playwright/test";
import { Base } from "../base";

class MemoPage extends Base {
  memoTextBox: Locator;
  addMemoButton: Locator;
  changeMemoButton: Locator;
  removeMemoButton: Locator;
  saveChangeMemo: Locator;
  memoHeading: Locator;
  memoTextRow1: Locator;

constructor(page) {
    super(page);
    this.memoTextBox = page.locator('#Text')
    this.addMemoButton = page.locator('input[value="Add Memorandum"]')
    this.changeMemoButton = page.locator('a[title="Change this memorandum."]')
    this.removeMemoButton = page.locator('a[title="Remove this memorandum from the list."]')
    this.saveChangeMemo = page.locator('input[value="Save"]')
    this.memoHeading = page.locator('div[id="content"] h3')
    this.memoTextRow1 = page.locator("xpath= //table[@class='formTable-zebra']/tbody[1]/tr[2]/td[2]")
}

async acceptDialog(){
    this.page.on('dialog', async dialog => {
    await dialog.accept(); 
})};

async addMemo(){
if (await this.memoTextBox.isVisible()){
    await this.memoTextBox.fill('Add memo test 1')
    await this.addMemoButton.click();
}
else{
    await this.addMemoButton.click()
    await this.memoTextBox.fill('Add memo test 2')
    await this.addMemoButton.click()
}
}

async changeMemo(){
    await this.changeMemoButton.click();
    await this.memoTextBox.fill('Change memo test')
    await this.saveChangeMemo.click()
}

async removeMemo(){
    await this.removeMemoButton.click()
    await this.acceptDialog();
}}
export default MemoPage;