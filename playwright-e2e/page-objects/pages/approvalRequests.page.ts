import { Locator, expect } from "@playwright/test";
import { Base } from "../base";

class ApprovalRequestsPage extends Base {
  acRoles: Locator;
  acLocations: Locator;
  approvalRequestsTable: Locator;
  approvalRequestsHeading: Locator;
  returnMessage: Locator;
      
constructor(page) {
  super(page);
  this.acRoles = page.locator("xpath=(//div[@class='InLineEditx'])[1]")
  this.acLocations = page.locator("xpath=(//div[@class='InLineEditx'])[2]")
  this.approvalRequestsTable = page.locator('table', { hasText: 'Name Email Primary Location' });
  this.approvalRequestsHeading = page.locator('div#content h2')
  this.returnMessage = page.locator('.ReturnMessage')

}
async clickApprove(userEmail: string, userRole: string, userLocation: string){
    const approveEmail = userEmail;
    console.log('Approve Email: ', approveEmail)
    const targetRowLocator = this.page.locator(`tr:has-text("${approveEmail}")`);
    await expect(targetRowLocator.getByText(userRole)).toBeVisible();
    await expect(targetRowLocator.getByText(userLocation)).toBeVisible();
    const approveLink = targetRowLocator.getByRole('link', { name: 'Approve', exact: true });
    await approveLink.click();
}

async clickReject(userEmail: string, userRole: string, userLocation: string){
    const rejectEmail = userEmail;
    console.log('Reject Email: ', rejectEmail)
    const targetRowLocator = this.page.locator(`tr:has-text("${rejectEmail}")`);
    await expect(targetRowLocator.getByText(userRole)).toBeVisible();
    await expect(targetRowLocator.getByText(userLocation)).toBeVisible();
    const rejectLink = targetRowLocator.getByRole('link', { name: 'Reject', exact: true });
    await rejectLink.click();
}
}
export default ApprovalRequestsPage;  