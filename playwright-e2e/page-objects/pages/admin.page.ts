import { Locator } from "@playwright/test";
import { Base } from "../base";

class AdminPage extends Base {
  adminHeading: Locator;
  usersLink: Locator;
  
   
constructor(page) {
    super(page);
    this.adminHeading = page.locator('div#content h2')
    this.usersLink = page.getByRole('link', { name: 'Users' })

}}
export default AdminPage;