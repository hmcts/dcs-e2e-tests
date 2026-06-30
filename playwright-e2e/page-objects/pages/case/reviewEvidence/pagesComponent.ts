import { Base } from "../../../base.ts";
import { Locator } from "playwright-core";
import { expect } from "../../../../fixtures.ts";

/**
 * This Pages Component represents the Pages panel on the Review Evidence page.
 * It encapsulates functionalities for navigating around documents and document pages
 * within the application's 'Review Evidence' page.
 *
 * This component is crucial for testing role-based access to restricted documents.
 */

class PagesComponent extends Base {
  topMenu: Locator;
  pagesMenuLink: Locator;
  goToPageLink: Locator;
  goToPageInput: Locator;

  constructor(page) {
    super(page);
    this.topMenu = page.locator("#topLevelMenu");
    this.pagesMenuLink = this.topMenu.locator("#rmiPage");
    this.goToPageLink = page.locator("#goToPage");
    this.goToPageInput = page.locator("#goToPageNumberInput");
  }

  async openPages() {
    await expect(this.pagesMenuLink).toBeVisible();
    await this.pagesMenuLink.click();
  }

  async goToPage(pageNumber: string) {
    await expect(this.pagesMenuLink).toBeVisible();
    await expect
      .poll(
        async () => {
          await this.pagesMenuLink.click();
          return this.goToPageLink.isVisible();
        },
        {
          timeout: 5000,
        },
      )
      .toBe(true);
    await this.goToPageLink.click();
    try {
      await expect
        .poll(
          async () => {
            return this.goToPageInput.isVisible();
          },
          {
            timeout: 3000,
          },
        )
        .toBe(true);
    } catch {
      await this.goToPageLink.click();
    }
    await this.goToPageInput.click();
    await this.goToPageInput.fill(pageNumber);
    await expect(this.goToPageInput).toHaveValue(pageNumber);
    await this.goToPageInput.press("Enter");
  }
}

export default PagesComponent;
