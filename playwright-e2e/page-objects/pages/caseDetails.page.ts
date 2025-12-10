import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";
import { Page } from "@playwright/test";
import { waitUntilClickable } from "../../utils";
import { Dialog } from "@playwright/test";

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
            // ---- Step 1: Attach a dialog handler before clicking ----
            const dialogs: Dialog[] = [];
            const dialogHandler = (dialog: Dialog) => {
              dialogs.push(dialog);
              dialog
                .accept()
                .catch((err) =>
                  console.warn("⚠️ Failed to accept dialog:", err)
                );
            };
            this.page.on("dialog", dialogHandler);

            // ---- Step 2: Click the remove button ----
            await waitUntilClickable(this.removeCaseBtn);
            await this.removeCaseBtn.click();

            // ---- Step 3: Wait until both dialogs (if any) were handled ----
            // Assuming max 2 dialogs
            const maxWait = timeoutMs;
            const start = Date.now();
            while (dialogs.length < 2 && Date.now() - start < maxWait) {
              await this.page.waitForTimeout(300); // small polling
            }

            // ---- Step 4: Cleanup listener ----
            this.page.off("dialog", dialogHandler);

            return true;
          } catch (err) {
            console.warn("⚠️ removeCase attempt failed:", err);
            return false; // retry poll
          }
        },
        {
          timeout: timeoutMs,
          intervals: [500, 1000, 1500],
        }
      )
      .toBe(true);
  }

  async tryOpenReviewPopup(): Promise<Page | null> {
    let popupPage: Page | null = null;

    try {
      const popupPromise = this.page.waitForEvent("popup", { timeout: 5000 });
      await this.caseNavigation.navigateTo("Review");
      popupPage = await popupPromise;

      const bodyText =
        (await popupPage
          .locator("body")
          .innerText()
          .catch(() => "")) ?? "";

      const isPaginationPopup =
        bodyText.includes("There are no documents in the paginated bundle") ||
        bodyText.includes(
          "The initial pagination for this bundle is underway"
        ) ||
        bodyText.trim().length === 0;

      if (isPaginationPopup) {
        await popupPage.close().catch(() => {});
        return null;
      }

      const reviewSectionPanel = await popupPage
        .locator("#bundleIndexDiv")
        .isVisible()
        .catch(() => false);

      if (!reviewSectionPanel) {
        await popupPage.close().catch(() => {});
        return null;
      }

      return popupPage;
    } catch {
      if (popupPage) await popupPage.close().catch(() => {});
      return null;
    }
  }

  async openReviewPopupAwaitPagination(maxWaitMs = 90000): Promise<Page> {
    let popup: Page | null = null;

    await expect
      .poll(
        async () => {
          popup = await this.tryOpenReviewPopup();
          return popup;
        },
        {
          timeout: maxWaitMs,
          intervals: [5000],
        }
      )
      .not.toBeNull();

    return popup!;
  }
}

export default CaseDetailsPage;
