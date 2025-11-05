import { Locator } from "@playwright/test";
import { Base } from "../base";

class UserSettingsPage extends Base { 
  userSettingsHeading : Locator;
  searchText: Locator;
  applyFilter: Locator;
  changeIsVerifiedUser: Locator;
  verifiedUserFlag: Locator;
  approvedUserFlag: Locator;
  deniedUserFlag: Locator;
      
constructor(page) {
    super(page);
    this.userSettingsHeading = page.locator('div#content h2')
    this.searchText = page.locator('#searchText')
    this.applyFilter = page.getByRole('link', { name: 'Apply Filter' })
    this.changeIsVerifiedUser = page.locator("xpath=(//a[contains(text(),'Change')])[5]")
    this.verifiedUserFlag = page.locator("xpath=//*[@id=\"personListDiv\"]/table/tbody/tr[2]/td[12]")
    this.approvedUserFlag = page.locator("xpath=//*[@id=\"personListDiv\"]/table/tbody/tr[2]/td[7]")
    this.deniedUserFlag = page.locator("xpath=//*[@id=\"personListDiv\"]/table/tbody/tr[2]/td[14]")

}

async searchUser(userName: string){
    await this.searchText.clear();
    await this.searchText.fill(userName);
    await this.applyFilter.click();
}

async updateVerifyUserFlag(){
    await this.changeIsVerifiedUser.click();
    const verifiedFlag = this.verifiedUserFlag.textContent;
    return verifiedFlag;
}

}
export default UserSettingsPage;