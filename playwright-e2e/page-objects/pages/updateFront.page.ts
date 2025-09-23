import { Locator } from "@playwright/test";
import { Base } from "../base";

class UpdateFrontPage extends Base {
  caseNameHeading: Locator;
  changeDetailsHeading: Locator;

  constructor(page) {
    super(page);
    this.caseNameHeading = page.locator(".heading-medium");
    this.changeDetailsHeading = page.locator("legend.heading-small");
  }
}

export default UpdateFrontPage;
