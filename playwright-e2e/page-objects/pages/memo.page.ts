import { Locator } from "@playwright/test";
import { Base } from "../base";

class MemoPage extends Base {
  memoTextBox: Locator;
  addMemoButton: Locator;
  addMemoLink: Locator;
  changeMemoButton: Locator;
  removeMemoButton: Locator;
  saveChangeMemo: Locator;
  memoHeading: Locator;
  memoTableRow1: Locator;
  memoTableRow2: Locator;


constructor(page) {
    super(page);
    this.memoTextBox = page.locator('#Text')
    this.addMemoButton = page.getByRole('button', { name: 'Add Memorandum' })
    this.addMemoLink = page.getByRole('link', { name: 'Add a Memorandum' }) 
    this.changeMemoButton = page.getByRole('link', { name: 'Change' }).first()
    this.removeMemoButton = page.getByRole('link', { name: 'Remove' }).first()
    this.saveChangeMemo = page.getByRole('button', { name: 'Save' })
    this.memoHeading = page.locator('div[id="content"] h3')
    this.memoTableRow1 = page.locator("xpath= //table[@class='formTable-zebra']/tbody[1]/tr[2]/td[2]")
    this.memoTableRow2 = page.locator("xpath= //table[@class='formTable-zebra']/tbody[1]/tr[3]/td[2]")
}

async addMemo(){
if (await this.memoTextBox.isVisible()){
    await this.memoTextBox.fill('Add memo test textbox directly available')
    await this.addMemoButton.click();
} else {
    await this.addMemoLink.click();
    await this.memoTextBox.fill('Add memo test via Add A Memorandum button')
    await this.addMemoButton.click();
}}

async changeMemo(){
    await this.changeMemoButton.click();
    await this.memoTextBox.fill('Change memo test')
    await this.saveChangeMemo.click()
}

async removeMemo(){
    const [dialog] = await Promise.all([
    this.page.waitForEvent('dialog'),
    await this.removeMemoButton.click()
]);
    await dialog.accept();
}

async addDefAMemo(){
if (await this.memoTextBox.isVisible()){
    await this.memoTextBox.fill('Defence A memo test textbox directly available')
    await this.addMemoButton.click();
} else {
    await this.addMemoLink.click();
    await this.memoTextBox.fill('Defence A memo test via Add A Memorandum button')
    await this.addMemoButton.click();
}}

async addDefBMemo(){
if (await this.memoTextBox.isVisible()){
    await this.memoTextBox.fill('Defence B memo test textbox directly available')
    await this.addMemoButton.click();
} else {
    await this.addMemoLink.click();
    await this.memoTextBox.fill('Defence B memo test via Add A Memorandum button')
    await this.addMemoButton.click();
}}
}
export default MemoPage;