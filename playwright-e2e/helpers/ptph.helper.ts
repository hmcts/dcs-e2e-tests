import { expect } from "../fixtures";
import { BrowserContext } from "@playwright/test";

export async function editPayloadView(page, caseUrn) {
  await page.goto(process.env.PREPROD_UPLOAD_PTPH_FORM_URL as string);

  await page.locator("#Urn").fill(caseUrn);
  await page.locator("#DocumentType").fill("ptph");
  await page.locator("#DocumentName").fill("ptphtest");

  await page
    .locator('input[name="uploadFile"]')
    .setInputFiles("playwright-e2e/data/PTPH.docx");

  await page.locator('input[type="submit"][value="Submit"]').click();
}

export async function getPayloadStatus(page, caseUrn: string) {
  await page.goto(process.env.PREPROD_CONFIRM_PTPH_UPLOAD_STATUS_URL as string);

  await expect(page.locator("body")).toBeVisible();

  let block: string | undefined;

  await expect
    .poll(
      async () => {
        page.reload();
        const html = await page.locator("body").innerHTML();
        const blocks = html.split("<hr>"); // each block = JSON + status

        block = blocks.find((b) => b.includes(`"Urn":"${caseUrn}"`));
        if (!block) return null;

        if (block.includes("Success")) return "Success";
        if (block.includes("Failed")) return "Failed";

        return null; // still in Started/Processing
      },
      { intervals: [1000], timeout: 60000 }
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
  await editPayloadView(uploadPage, caseUrn);

  // Step 2: Check status
  const statusPage = await context.newPage();
  await getPayloadStatus(statusPage, caseUrn);

  console.log(`PTPH form successfully uploaded for URN: ${caseUrn}`);
}
