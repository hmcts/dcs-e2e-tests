import { Base } from "../base";
import { Locator } from "playwright-core";
import { expect } from "playwright/test";

class PeoplePage extends Base {
  inviteNewParticipantBtn: Locator;
  addEmailAddress: Locator;
  selectBtn: Locator;
  roleSelector: Locator;
  inviteBtn: Locator;
  pageTitle: Locator;

  constructor(page) {
    super(page);
    this.inviteNewParticipantBtn = page
      .getByRole("link", {
        name: "Invite New Participant",
      })
      .first();
    this.addEmailAddress = page.getByRole("textbox", {
      name: "Person's Email",
    });
    this.selectBtn = page.getByRole("link", { name: "Select" });
    this.roleSelector = page.getByRole("radio");
    this.inviteBtn = page.getByRole("button", { name: "Invite" });
    this.pageTitle = page.getByRole("heading", {
      level: 3,
      name: "People Index",
    });
  }

  async addUser(username: string, defendants?: string[]) {
    await this.inviteNewParticipantBtn.click();
    await expect(this.addEmailAddress).toBeEditable({ timeout: 30000 });
    await this.addEmailAddress.fill(`${username}`);
    await this.selectBtn.click();
    await this.roleSelector.first().click();
    if (defendants) {
      for (const defendant of defendants) {
        await this.page
          .getByRole("checkbox", { name: `${defendant} -` })
          .check();
      }
    }
    await this.inviteBtn.click();
  }

  async confirmUserAccess(lastName: string, role: string) {
    const userRow = this.page.locator("table.formTable-zebra tbody tr").filter({
      hasText: `${lastName}`,
    });
    await expect(
      userRow,
      `${role} user: ${lastName} does not have access to this case.`
    ).toBeVisible({ timeout: 30000 });
  }
}

export default PeoplePage;
