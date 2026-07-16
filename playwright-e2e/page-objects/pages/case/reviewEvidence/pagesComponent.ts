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
  nextDocumentLink: Locator;
  previousDocumentLink: Locator;
  pageDirectionLink: Locator;
  pageDirectionSuccessfulTick: Locator;
  pageDirectionPopup: Locator;
  jumpToPageDirection: Locator;

  constructor(page) {
    super(page);
    this.topMenu = page.locator("#topLevelMenu");
    this.pagesMenuLink = this.topMenu.locator("#rmiPage");
    this.goToPageLink = page.locator("#goToPage");
    this.goToPageInput = page.locator("#goToPageNumberInput");
    this.nextDocumentLink = page.locator("#nextDiv");
    this.previousDocumentLink = page.locator("#previousDiv");
    this.pageDirectionLink = page.locator("#displayToCourt");
    this.pageDirectionSuccessfulTick = this.pageDirectionLink.locator("img");
    this.pageDirectionPopup = page.locator("#confirmJumpPopupDiv");
    this.jumpToPageDirection = page.locator("#jumpYes");
  }

  async openPages(link: Locator) {
    const durationMs = 1_000;
    const intervalMs = 200;
    const start = Date.now();

    await expect(this.pagesMenuLink).toBeVisible();
    await this.pagesMenuLink.click();

    while (Date.now() - start < durationMs) {
      await expect(link).toBeVisible();
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  async goToPage(pageNumber: string) {
    await this.openPages(this.goToPageLink);
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

  async getNavigationDirection(
    fromSection: string,
    toSection: string,
  ): Promise<"next" | "previous"> {
    return toSection.localeCompare(fromSection) <= 0 ? "previous" : "next";
  }

  async goToNextDocument() {
    await this.openPages(this.nextDocumentLink);
    await this.nextDocumentLink.click();
  }

  async goToPreviousDocument() {
    await this.openPages(this.previousDocumentLink);
    await this.previousDocumentLink.click();
  }

  async selectPageDirection() {
    await this.openPages(this.pageDirectionLink);
    await this.pageDirectionLink.click();
    await expect
      .poll(
        async () => {
          return this.pageDirectionSuccessfulTick.isVisible();
        },
        {
          timeout: 10000,
        },
      )
      .toBe(true);
  }

  async validateNoPageDirection() {
    const durationMs = 15000;
    const intervalMs = 200;
    const start = Date.now();

    while (Date.now() - start < durationMs) {
      await expect(this.pageDirectionPopup).toBeHidden();
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  async acceptPageDirection() {
    await expect
      .poll(
        async () => {
          return await this.pageDirectionPopup.isVisible();
        },
        {
          timeout: 15000,
        },
      )
      .toBe(true);
    await this.jumpToPageDirection.click();
  }
}

export default PagesComponent;
