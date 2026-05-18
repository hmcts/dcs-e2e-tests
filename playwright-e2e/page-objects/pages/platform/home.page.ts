import { Base } from "../../base.ts";
import { config } from "../../../utils/config.utils.ts";
import { Locator } from "playwright-core";

/**
 * Represents the application's Home Page.
 */
class HomePage extends Base {
  accountMessage: Locator;

  constructor(page) {
    super(page);
    this.accountMessage = page.locator("#content");
  }

  /**
   * Navigates the browser to the application's base URL, opening the home page.
   */
  async open() {
    await this.page.goto(config.urls.base);
  }
}

export default HomePage;
