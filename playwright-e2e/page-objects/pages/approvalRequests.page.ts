import { Locator } from "@playwright/test";
import { Base } from "../base";

class AprrovalRequestsPage extends Base {
  acRole: Locator;
  acLocation: Locator;
  userEmail: Locator;
  userLocation: Locator;
  userRole: Locator;
  approveButton: Locator;
  rejectButton: Locator;
  approvalRequestsHeading: Locator;
  returnMessage: Locator;

      
constructor(page) {
    super(page);
    this.acRole = page.locator("xpath=(//div[@class='InLineEditx'])[1]")
    this.acLocation = page.locator("xpath=(//div[@class='InLineEditx'])[2]")
    this.userEmail = page.locator("xpath=(//*[@id=\"content\"]/table/tbody/tr[2]/td[2])").nth(0)
    this.userLocation = page.locator("xpath=(//*[@id=\"content\"]/table/tbody/tr[2]/td[3])").nth(0)
    this.userRole = page.locator("xpath=(//*[@id=\"content\"]/table/tbody/tr[2]/td[4])").nth(0)
    this.approveButton = page.getByRole('link', { name: 'Approve' }).nth(0)
    this.rejectButton = page.getByRole('link', { name: 'Reject' }).nth(0)
    this.approvalRequestsHeading = page.locator('div#content h2')
    this.returnMessage = page.locator('.ReturnMessage')

}}
export default AprrovalRequestsPage;