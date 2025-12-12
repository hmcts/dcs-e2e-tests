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

    // 1 — Check for existing popup
    const existingPopups = this.page
      .context()
      .pages()
      .filter((p) => p !== this.page);
    if (existingPopups.length > 0) {
      popupPage = existingPopups[0];
    } else {
      const popupPromise = this.page.waitForEvent("popup");
      await this.caseNavigation.navigateTo("Review");
      popupPage = await popupPromise;
    }

    try {
      const statusHandle = await popupPage.waitForFunction<
        "wrong" | "ready" | "loading"
      >(
        () => {
          const body = document.body.innerText || "";

          // clearly wrong content
          const isPaginationPopup =
            body.includes("There are no documents in the paginated bundle") ||
            body.includes(
              "The initial pagination for this bundle is underway"
            ) ||
            body.trim().length === 0;

          if (isPaginationPopup) return "wrong";

          const panel = document.querySelector(
            "#bundleIndexDiv"
          ) as HTMLElement | null;
          if (panel?.offsetParent !== null) return "ready";

          return "loading"; // still loading
        },
        { timeout: 30000, polling: 500 }
      );

      const status = await statusHandle.jsonValue();

      if (status === "wrong") {
        await popupPage.close().catch(() => {});
        return null; // signal to retry
      } else if (status === "ready") {
        return popupPage; // good popup
      } else {
        // still loading — wait a bit and retry
        await this.page.waitForTimeout(1000);
        return null;
      }
    } catch {
      if (popupPage) await popupPage.close().catch(() => {});
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
