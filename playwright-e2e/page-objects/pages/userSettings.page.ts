import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";

class UserSettingsPage extends Base {
  userSettingsHeading: Locator;
  searchText: Locator;
  applyFilter: Locator;
  changeIsVerifiedUser: Locator;
  verifiedUserFlag: Locator;
  approvedUserFlag: Locator;
  deniedUserFlag: Locator;
  userResultsTitle: Locator;
  userResultsContainer: Locator;
  userResultsTable: Locator;

  constructor(page) {
    super(page);
    this.userSettingsHeading = page.locator("div#content h2");
    this.searchText = page.locator("#searchText");
    this.applyFilter = page.getByRole("link", { name: "Apply Filter" });
    this.userResultsContainer = page.locator("#personListDiv");
    this.userResultsTable = page.locator(".formTable-zebra");
    this.changeIsVerifiedUser = page.locator(
      "xpath=(//a[contains(text(),'Change')])[5]"
    );
    this.verifiedUserFlag = page.locator(
      'xpath=//*[@id="personListDiv"]/table/tbody/tr[2]/td[12]'
    );
    this.approvedUserFlag = page.locator(
      'xpath=//*[@id="personListDiv"]/table/tbody/tr[2]/td[7]'
    );
    this.deniedUserFlag = page.locator(
      'xpath=//*[@id="personListDiv"]/table/tbody/tr[2]/td[14]'
    );
    this.userResultsTitle = page
      .locator("td")
      .filter({ hasText: "Results:" })
      .first();
  }

  async usersTableLoad() {
    const loaders = this.userResultsContainer.locator(
      'img[alt="Please wait ..."]'
    );
    await expect(loaders).toHaveCount(0, { timeout: 60_000 });
  }

  async searchUser(userName: string) {
    await this.searchText.clear();
    await this.searchText.fill(userName);
    await this.applyFilter.click();
    await this.usersTableLoad();
    await expect(this.userResultsTable).toBeVisible({ timeout: 30000 });
  }

  async updateVerifyUserFlag() {
    await this.changeIsVerifiedUser.click();
    const verifiedFlag = this.verifiedUserFlag.textContent;
    return verifiedFlag;
  }
}
export default UserSettingsPage;
