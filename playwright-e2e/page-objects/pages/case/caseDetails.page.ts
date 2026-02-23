import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { expect } from "../../../fixtures";
import { waitUntilClickable } from "../../../utils";
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
  invitationOnlyValue: Locator;
  prosecutedByValue: Locator;
  caseUrnValue: Locator;
  hearingDateValue: Locator;
  courtHouseValue: Locator;
  frontPageValue: Locator;

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
    this.invitationOnlyValue = page
      .getByRole("row", { name: /Case is Invitation Only/i })
      .locator("td.display-field");
    this.prosecutedByValue = page
      .getByRole("row", { name: /Case Prosecuted By/i })
      .locator("td.display-field");
    this.caseUrnValue = page
      .getByRole("row", { name: /URN/i })
      .locator("td.display-field");
    this.hearingDateValue = page
      .getByRole("row", { name: /Hearing Dates/i })
      .locator("td.display-field");
    this.courtHouseValue = page
      .getByRole("row", { name: /Court House/i })
      .locator("td.display-field");
    this.frontPageValue = page.locator(".caseDescription");
  }

  /**
   * Validates that the correct details have been populated on the Case Details page after
   * creating a new case (createCase.spec.ts).
   */
  async validateCaseDetails(
    caseName: string,
    caseUrn: string,
    prosecutedBy: string,
  ) {
    await expect(this.caseNameHeading).toHaveText(caseName);
    await expect(this.prosecutedByValue).toContainText(prosecutedBy);
    if (prosecutedBy === "CPS") {
      await expect(this.caseUrnValue).toContainText(caseUrn);
    }
    await expect(this.courtHouseValue).toContainText("Southwark");

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const yy = String(today.getFullYear()).slice(-2); // last 2 digits
    const todayFormatted = `${dd}.${mm}.${yy}`; // "10.02.26"
    await expect(this.hearingDateValue).toContainText(todayFormatted);
    await expect(this.frontPageValue).toHaveText("Front Page Test");
  }

  /**
   * Validates that the correct defendant details are present on the Case Details page (createCase.spec.ts)
   */
  async validateDefendants() {
    await expect(this.nameDefOne).toBeVisible();
    await expect(this.nameDefTwo).toBeVisible();
  }

  /**
   * Validates that the correct details are visible on the Case Details page following update (createCase.spec.ts).
   */
  async validateCaseUpdate() {
    await expect(this.additionalNotes).toBeVisible();
    await expect(this.additionalNotes).toHaveText("Test additional notes");
    await expect(this.invitationOnlyValue).toHaveText(/Yes/);
    await expect(this.frontPageValue).toHaveText("Update Front Page");
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
   * Confirms that a case has successfully been split using the Split Page functionality.
   * Successful split results in the Case Details page rendering a message including
   * 'Case Has Split'. Other validation methods (eg. split progress bar) proved unreliable for
   * validation at this time
   */
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
        },
      )
      .toBe(true);
  }

  async goToSplitCase(caseName) {
    await this.page.getByRole("link", { name: `${caseName}One` }).click();
  }

  /**
   * Confirms that a case has successfully been merged using the Merge Page functionality.
   * Successful split results in the Case Details page rendering a message including
   * 'Case Has Merged'. Other validation methods (eg. merge progress bar) proved unreliable for
   * validation at this time
   */
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
        },
      )
      .toBe(true);
  }
}

export default CaseDetailsPage;
