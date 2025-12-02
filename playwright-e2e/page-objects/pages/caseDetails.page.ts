import { Locator } from "@playwright/test";
import { Base } from "../base";

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

  async removeCase() {
    // First dialog
    const firstDialogPromise = this.page.waitForEvent("dialog");
    await this.removeCaseBtn.click();
    const firstDialog = await firstDialogPromise;
    const secondDialogPromise = this.page.waitForEvent("dialog");
    try {
      await firstDialog.accept();
    } catch (err) {
      console.warn("⚠️ Failed to accept first dialog:", err);
    }

    // Second dialog
    const secondDialog = await secondDialogPromise;
    try {
      await secondDialog.accept();
    } catch (err) {
      console.warn("⚠️ Failed to accept second dialog:", err);
    }
  }

  async openReviewPopupAwaitPagination(maxWaitSeconds = 90) {
    const startTime = Date.now();

    while ((Date.now() - startTime) / 1000 < maxWaitSeconds) {
      let popupPage: import("@playwright/test").Page | null = null;

      try {
        const popupPromise = this.page.waitForEvent("popup", { timeout: 5000 });
        await this.caseNavigation.navigateTo("Review");
        popupPage = await popupPromise;

        let bodyText = "";
        try {
          bodyText = await popupPage
            .locator("body")
            .innerText({ timeout: 2000 });
        } catch {
          bodyText = "";
        }

        // WRONG POPUP: pagination still happening
        const isPaginationPopup =
          bodyText.includes("There are no documents in the paginated bundle") ||
          bodyText.includes(
            "The initial pagination for this bundle is underway"
          ) ||
          bodyText.trim().length === 0;

        if (isPaginationPopup) {
          console.log(
            "Wrong popup (awaiting pagination). Closing and retrying..."
          );
          await popupPage.close().catch(() => {});
          await this.page.waitForTimeout(5000);
          continue;
        }

        // REQUIRED SELECTOR: Only present on correct popup
        const bundleIndex = popupPage.locator("#bundleIndexDiv");

        const isVisible = await bundleIndex.isVisible().catch(() => false);

        if (!isVisible) {
          console.log("Popup missing #bundleIndexDiv (not ready). Closing...");
          await popupPage.close().catch(() => {});
          await this.page.waitForTimeout(5000);
          continue;
        }

        // CORRECT POPUP — Return it
        console.log("Correct Review popup loaded");
        return popupPage;
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.log("No popup within 5 seconds, retrying...", err.message);
        } else {
          console.log("No popup within 5 seconds, retrying...");
        }

        if (popupPage) {
          await popupPage.close().catch(() => {});
        }

        await this.page.waitForTimeout(5000);
      }
    }

    throw new Error("Failed to open the review popup within timeout");
  }
}

export default CaseDetailsPage;
