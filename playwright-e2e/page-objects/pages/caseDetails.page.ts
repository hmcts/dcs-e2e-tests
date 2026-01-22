import { Locator } from "@playwright/test";
import { Base } from "../base";
import { expect } from "../../fixtures";
import { Page } from "@playwright/test";
import { waitUntilClickable } from "../../utils";
import { Dialog } from "@playwright/test";

/**
 * Represents the Case Details page, displaying information about a specific case.
 * This Page Object provides locators and methods for interacting with case data,
 * managing defendants, changing case details, and accessing review functionalities.
 */

class CaseDetailsPage extends Base {
  caseNameHeading: Locator;
  caseDetailsHeading: Locator;
  addDefButton: Locator;
  changeCaseDetailsBtn: Locator;
  nameDefOne: Locator;
  nameDefTwo: Locator;
  additionalNotes: Locator;
  removeCaseBtn: Locator;

  constructor(page) {
    super(page);
    this.caseNameHeading = page.locator(".heading-medium");
    this.caseDetailsHeading = page.locator("legend.heading-small");
    this.addDefButton = page.getByRole("link", { name: "Add Defendant" });
    this.changeCaseDetailsBtn = page
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
    this.additionalNotes = page.getByRole("cell", {
      name: "Test additional notes",
    });
    this.removeCaseBtn = page.getByRole("link", { name: "Remove Case" });
  }

  /**
   * Clicks the "Add Defendant" button to navigate to the Add Defendant page.
   */
  async goToAddDefendant() {
    await this.addDefButton.click();
  }

  /**
   * Clicks the "Change Case Details" button to navigate to the Change Case Details page.
   */
  async goToChangeCaseDetails() {
    await this.changeCaseDetailsBtn.click();
  }

  /**
   * Initiates the process to remove a case, handling confirmation dialogs.
   * This method includes robust polling and dialog handling due to UI flakiness.
   * @param {number} timeoutMs - Maximum time to wait for the removal process to complete.
   */
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
                  console.warn(
                    "⚠️ Failed to accept case deletion dialog:",
                    err,
                  ),
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
        },
      )
      .toBe(true);
  }

  /**
   * Attempts to open the Review popup for the current case.
   * Handles existing popups and checks the state of the new popup.
   * @returns {Promise<Page | null>} A Promise that resolves to the Playwright Page object of the popup if successful and ready, otherwise null.
   */
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
              "There are no documents in the paginated bundle",
            ) ||
            bodyText.includes(
              "The initial pagination for this bundle is underway",
            );

          if (isPaginationPopup) return "wrong";

          const panel = document.querySelector(
            "#bundleIndexDiv",
          ) as HTMLElement | null;

          if (panel && panel.offsetParent !== null) return "ready";

          return "loading";
        },
      );

      if (status === "wrong") {
        if (popupPage && !popupPage.isClosed()) {
          await popupPage.close().catch(() => {});
        }
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

  /**
   * Opens the Review popup and waits for its content to be fully paginated and ready.
   * This method repeatedly calls `tryOpenReviewPopup` until the popup is ready or a timeout occurs.
   * @param {number} maxWaitMs - Maximum time to wait for the Review popup to become ready.
   * @returns {Promise<Page>} A Promise that resolves to the Playwright Page object of the ready popup.
   * @throws {Error} If the Review popup is not ready within the specified timeout.
   */
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
      `Unable to open Review popup with correct content after ${maxWaitMs}ms`,
    );
  }

  async confirmCaseSplit() {
    await expect
      .poll(
        async () => {
          await this.caseNavigation.navigateTo("CaseHome");

          const caseSplitConfirmation = this.page.locator(".heading-medium");
          const text = await caseSplitConfirmation.textContent();

          if (text === "Case Has Split") {
            return true;
          } else {
            return false;
          }
        },
        {
          timeout: 120_000,
          message: `Unable to verify Case Split`,
        }
      )
      .toBe(true);
  }

  async goToSplitCase(caseName) {
    await this.page.getByRole("link", { name: `${caseName}One` }).click();
  }

  async confirmCaseMerge() {
    await expect
      .poll(
        async () => {
          await this.caseNavigation.navigateTo("CaseHome");

          const caseSplitConfirmation = this.page.locator(".heading-medium");
          const text = await caseSplitConfirmation.textContent();

          if (text === "Case Has Merged") {
            return true;
          } else {
            return false;
          }
        },
        {
          timeout: 120_000,
          message: `Unable to verify Case Merge`,
        }
      )
      .toBe(true);
  }
}

export default CaseDetailsPage;
