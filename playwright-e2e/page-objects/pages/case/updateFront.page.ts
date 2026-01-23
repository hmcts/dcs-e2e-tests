import { Locator } from "@playwright/test";
import { Base } from "../../base";

/**
 * Represents the "Update Front Page" functionality, typically used for
 * modifying high-level case information displayed on a case's front page.
 * This Page Object provides locators for key headings on this page.
 */
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
