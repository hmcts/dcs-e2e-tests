import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

class ApprovalRequestsPage extends Base {
  approvalRequestsTable: Locator;
  approvalRequestsHeading: Locator;
  returnMessage: Locator;

  constructor(page) {
    super(page);
    this.approvalRequestsTable = page.locator("table", {
      hasText: "Name Email Primary Location",
    });
    this.approvalRequestsHeading = page.locator("div#content h2");
    this.returnMessage = page.locator(".ReturnMessage");
  }

  async approvalsTableLoad() {
    await this.approvalRequestsTable.isVisible({ timeout: 30000 });
  }

  async confirmUserRequestVisible(
    userRole: string,
    userEmail: string,
    userLocation: string
  ) {
    await expect(this.approvalRequestsHeading).toHaveText("Approval Requests");
    const row = this.page.locator("tr", {
      has: this.page.locator("td", { hasText: `${userEmail}` }),
    });
    await expect(row).toContainText(userRole);
    await expect(row).toContainText(userLocation);
  }

  async clickApprove(
    userEmail: string,
    userRole: string,
    userLocation: string
  ) {
    await this.approvalsTableLoad();
    await this.confirmUserRequestVisible(userRole, userEmail, userLocation);
    const row = this.page.locator("tr", {
      has: this.page.locator("td", { hasText: `${userEmail}` }),
    });
    const approveLink = row.getByRole("link", {
      name: "Approve",
      exact: true,
    });
    await approveLink.click();
  }

  async clickReject(userEmail: string, userRole: string, userLocation: string) {
    await this.approvalsTableLoad();
    await this.confirmUserRequestVisible(userRole, userEmail, userLocation);
    const row = this.page.locator("tr", {
      has: this.page.locator("td", { hasText: `${userEmail}` }),
    });
    const rejectLink = row.getByRole("link", {
      name: "Reject",
      exact: true,
    });
    await rejectLink.click();
  }
}
export default ApprovalRequestsPage;
