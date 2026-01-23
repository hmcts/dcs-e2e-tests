import { Locator, expect } from "@playwright/test";
import { Base } from "../../../base";

/**
 * Represents the "Approval Requests" page where administrators can manage
 * user access requests. This Page Object provides methods to view, confirm
 * the visibility of, approve, or reject user access requests.
 */
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

  /**
   * Waits for the approval requests table to become visible.
   */
  async approvalsTableLoad() {
    await this.approvalRequestsTable.isVisible({ timeout: 30000 });
  }

  /**
   * Confirms that a specific user's approval request is visible in the table.
   */
  async confirmUserRequestVisible(
    userRole: string,
    userEmail: string,
    userLocation: string,
  ) {
    await expect(this.approvalRequestsHeading).toHaveText("Approval Requests");
    const row = this.page.locator("tr", {
      has: this.page.locator("td", { hasText: `${userEmail}` }),
    });
    await expect(row).toContainText(userRole);
    await expect(row).toContainText(userLocation);
  }

  /**
   * Clicks the "Approve" link for a specific user's request.
   */
  async clickApprove(
    userEmail: string,
    userRole: string,
    userLocation: string,
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

  /**
   * Clicks the "Reject" link for a specific user's request.
   */
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
