import { expect } from "../fixtures";
import { BrowserContext } from "@playwright/test";
import { config } from "../utils";

export async function editPayloadForm(page, caseUrn) {
  await page.goto(config.urls.ptphUpload);

  await page.locator("#Urn").fill(caseUrn);
  await page.locator("#DocumentType").fill("ptph");
  await page.locator("#DocumentName").fill("ptphtest");

  await page
    .locator('input[name="uploadFile"]')
    .setInputFiles("playwright-e2e/data/PTPH.docx");

  await page.locator('input[type="submit"][value="Submit"]').click();
}

export async function getPayloadStatus(page, caseUrn: string) {
  await page.goto(config.urls.ptphStatus);

  await expect(page.locator("body")).toBeVisible();

  let block: string | undefined;

  await expect
    .poll(
      async () => {
        await page.reload();
        const body = page.locator("body");
        await expect(body).toBeVisible();
        const html = await body.innerHTML();
        const blocks = html.split("<hr>"); // each block = JSON + status

        block = blocks.find((b) => b.includes(`"Urn":"${caseUrn}"`));
        if (!block) return null;

        if (block.includes("Success")) return "Success";
        if (block.includes("Failed")) return "Failed";

        return null; // still in Started/Processing stage
      },
      { intervals: [1000], timeout: 120000 }
    )
    .toMatch(/Success|Failed/);

  if (!block?.includes("Success")) {
    throw new Error(
      `PTPH form upload failed for URN ${caseUrn}. Status block:\n ${block}`
    );
  }

  console.log(`PTPH form successfully uploaded for URN: ${caseUrn}`);
}

export async function uploadPTPHForm(context: BrowserContext, caseUrn: string) {
  console.log(`Uploading PTPH form for URN: ${caseUrn}`);

  // Step 1: Upload form
  const uploadPage = await context.newPage();
  try {
    await editPayloadForm(uploadPage, caseUrn);
  } finally {
    await uploadPage.close();
  }

  // Step 2: Check status
  const statusPage = await context.newPage();
  try {
    await getPayloadStatus(statusPage, caseUrn);
  } finally {
    await statusPage.close();
  }
}
