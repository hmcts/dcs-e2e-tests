import { Page } from "playwright-core";

/**
 * Attempts to open the Review popup for the current case.
 * Handles existing popups and checks the state of the new popup.
 * @returns {Promise<Page | null>} A Promise that resolves to the Playwright Page object of the popup if successful and ready, otherwise null.
 */
export async function tryOpenReviewPopup(
  caseDetailsPage,
): Promise<Page | null> {
  let popupPage: Page | null = null;

  // Reuse existing popup if present
  const existingPopups = caseDetailsPage.page
    .context()
    .pages()
    .filter((p) => p !== caseDetailsPage.page && !p.isClosed());

  if (existingPopups.length > 0) {
    popupPage = existingPopups[0];
  } else {
    const popupPromise = caseDetailsPage.page.waitForEvent("popup");
    await caseDetailsPage.caseNavigation.navigateTo("Review");
    popupPage = await popupPromise;
  }

  try {
    // Wait until DOM is safe to inspect
    await popupPage!.waitForFunction(() => !!document.body, {
      timeout: 30000,
    });

    const status = await popupPage!.evaluate<"wrong" | "ready" | "loading">(
      () => {
        const bodyText = document.body?.innerText ?? "";

        const isPaginationPopup =
          bodyText.includes("There are no documents in the paginated bundle") ||
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
export async function openReviewPopupAwaitPagination(
  caseDetailsPage,
  maxWaitMs = 90000,
): Promise<Page> {
  const start = Date.now();
  let popup: Page | null = null;

  while (Date.now() - start < maxWaitMs) {
    popup = await tryOpenReviewPopup(caseDetailsPage);

    if (popup) return popup;

    // retry loop — avoids creating multiple popups
    await caseDetailsPage.page.waitForTimeout(1000);
  }

  throw new Error(
    `Unable to open Review popup with correct content after ${maxWaitMs}ms`,
  );
}
