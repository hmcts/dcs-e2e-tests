import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";
import { Page } from "@playwright/test";
import { waitUntilClickable } from "../../utils";

class CaseDetailsPage extends Base {
  caseNameHeading: Locator;
  caseDetailsHeading: Locator;
  addDefButton: Locator;
  changeCaseButton: Locator;
  nameDefOne: Locator;
  nameDefTwo: Locator;
  verifyAdditionalNotes: Locator;
  removeCaseBtn: Locator;

  constructor(page) {
    super(page);
    this.caseNameHeading = page.locator(".heading-medium");
    this.caseDetailsHeading = page.locator("legend.heading-small");
    this.addDefButton = page.getByRole("link", { name: "Add Defendant" });
    this.changeCaseButton = page
      .getByRole("link", { name: "Change Case Details" })
      .first();
    this.nameDefOne = page.getByRole("cell", {
      name: "Defendant One",
      exact: true,
    });
    this.nameDefTwo = page.getByRole("cell", {
      name: "Defendant Two",
      exact: true,
    });
    this.verifyAdditionalNotes = page.getByRole("cell", {
      name: "Test additional notes",
    });
    this.removeCaseBtn = page.getByRole("link", { name: "Remove Case" });
  }

  async goToAddDefendant() {
    await this.addDefButton.click();
  }

  async goToChangeCaseDetails() {
    await this.changeCaseButton.click();
  }

  async removeCase(timeoutMs = 60000) {
    await expect
      .poll(
        async () => {
          try {
            let dialogHandled = false;

            this.page.once("dialog", async (dialog) => {
              try {
                await dialog.accept();
                dialogHandled = true;
              } catch (err) {
                console.warn("⚠️ Failed to accept case deletion dialog:", err);
              }
            });

            await waitUntilClickable(this.removeCaseBtn);
            await this.removeCaseBtn.click();

            await this.page.waitForTimeout(1000);

            return dialogHandled;
          } catch (err) {
            console.warn("⚠️ removeCase attempt failed, will retry:", err);
            return false;
          }
        },
        { timeout: timeoutMs, intervals: [500, 1000, 1500] }
      )
      .toBe(true);
  }

  async tryOpenReviewPopup(): Promise<Page | null> {
    let popupPage: Page | null = null;

    // Reuse existing popup if present
    const existingPopups = this.page
      .context()
      .pages()
      .filter((p) => p !== this.page && !p.isClosed());

    if (existingPopups.length > 0) {
      popupPage = existingPopups[0];
    } else {
      const popupPromise = this.page.waitForEvent("popup");
      await this.caseNavigation.navigateTo("Review");
      popupPage = await popupPromise;
    }

    try {
      // 🔑 Wait until DOM is safe to inspect
      await popupPage.waitForFunction(() => !!document.body, {
        timeout: 30000,
      });

      const status = await popupPage.evaluate<"wrong" | "ready" | "loading">(
        () => {
          const bodyText = document.body?.innerText ?? "";

          const isPaginationPopup =
            bodyText.includes(
              "There are no documents in the paginated bundle"
            ) ||
            bodyText.includes(
              "The initial pagination for this bundle is underway"
            );

          if (isPaginationPopup) return "wrong";

          const panel = document.querySelector(
            "#bundleIndexDiv"
          ) as HTMLElement | null;

          if (panel && panel.offsetParent !== null) return "ready";

          return "loading";
        }
      );

      if (status === "wrong") {
        await popupPage.close().catch(() => {});
        return null;
      }

      if (status === "ready") {
        return popupPage;
      }

      // Still loading — keep popup open
      return null;
    } catch {
      if (popupPage && !popupPage.isClosed()) {
        await popupPage.close().catch(() => {});
      }
      return null;
    }
  }

  async openReviewPopupAwaitPagination(maxWaitMs = 90000): Promise<Page> {
    const start = Date.now();
    let popup: Page | null = null;

    while (Date.now() - start < maxWaitMs) {
      popup = await this.tryOpenReviewPopup();

      if (popup) return popup;

      // retry loop — avoids creating multiple popups
      await this.page.waitForTimeout(1000);
    }

    throw new Error(
      `Unable to open Review popup with correct content after ${maxWaitMs}ms`
    );
  }
}

export default CaseDetailsPage;
