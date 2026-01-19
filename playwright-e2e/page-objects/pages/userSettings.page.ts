import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";

class UserSettingsPage extends Base {
  userSettingsHeading: Locator;
  searchText: Locator;
  applyFilter: Locator;
  userResultsContainer: Locator;
  userResultsTable: Locator;

  constructor(page) {
    super(page);
    this.userSettingsHeading = page.locator("div#content h2");
    this.searchText = page.locator("#searchText");
    this.applyFilter = page.getByRole("link", { name: "Apply Filter" });
    this.userResultsContainer = page.locator("#personListDiv");
    this.userResultsTable = page.locator(".formTable-zebra");
  }

  async usersTableLoad(minStableMs = 2000) {
    const loaders = this.userResultsContainer.locator(
      'img[alt="Please wait ..."]'
    );

    await expect
      .poll(
        async () => {
          const count = await loaders.count();
          if (count > 0) return false; // still visible

          // loader is currently gone, wait for stability
          await this.page.waitForTimeout(minStableMs);

          // check loader is still gone as periodically is reappears
          return (await loaders.count()) === 0;
        },
        {
          timeout: 60_000,
          message: `User table loader did not remain hidden for ${minStableMs}ms`,
        }
      )
      .toBe(true);
  }

  async searchUser(userName: string) {
    await this.searchText.clear();
    await this.searchText.fill(userName);
    await this.applyFilter.click();
    await this.usersTableLoad();
    await expect(this.userResultsTable).toBeVisible({ timeout: 30000 });
  }

  async verifyUserEmail(userEmail) {
    const row = this.page.locator("tr", {
      has: this.page.locator("td", { hasText: `${userEmail}` }),
    });
    const verify = row.locator("td").nth(11);
    await verify.getByRole("link", { name: "Change" }).click();
    await this.usersTableLoad();
    const verifiedFlag = await verify.textContent();
    expect(verifiedFlag).toContain("Y");
  }

  async verifyApprovalFlag(userName: string) {
    await expect(this.userSettingsHeading).toContainText("People List");
    await this.searchUser(userName);
    const row = this.page.locator("tr", {
      has: this.page.locator("td", { hasText: `${userName}` }),
    });
    const approval = row.locator("td").nth(11);
    await expect(approval).toContainText("Y");
  }

  async verifyRejectionFlag(userName: string) {
    await expect(this.userSettingsHeading).toContainText("People List");
    await this.searchUser(userName);
    const row = this.page.locator("tr", {
      has: this.page.locator("td", { hasText: `${userName}` }),
    });
    const accessDenied = row.locator("td").nth(13);
    await expect(accessDenied).toContainText("Y");
  }
}
export default UserSettingsPage;
