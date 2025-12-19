import { Locator } from "@playwright/test";
import { Base } from "../base";
import { DocumentModel } from "../../data/documentModel";
import UploadDocumentPage from "./uploadDocument.page";
import { expect } from "../../fixtures";

class IndexPage extends Base {
  uploadDocumentPage: UploadDocumentPage;
  indexTable: Locator;
  baseTableRows: Locator;
  sectionLinks: Locator;
  pd1SectionLocator: Locator;
  pd2SectionLocator: Locator;

  constructor(page) {
    super(page);
    this.uploadDocumentPage = new UploadDocumentPage(page);
    this.indexTable = page.locator("table.fullContents:visible");
    this.baseTableRows = page.locator(
      'xpath=//*[@id="aspnetForm"]/table[2]/tbody/tr'
    );
    this.sectionLinks = page.locator("a.contentsAnchor");
    this.pd1SectionLocator = page.getByText("PD1:", { exact: true });
    this.pd2SectionLocator = page.getByText("PD2:", { exact: true });
  }

  async indexTableLoad() {
    const indexTable = this.page.locator(".fullContents");
    const loaders = indexTable.locator(
      'img[alt="working"][src*="spinning/wait16trans.gif"]'
    );
    await expect(loaders).toHaveCount(0, { timeout: 180_000 });
    console.log("Successful load of Index Table");
  }

  async rowCount(): Promise<number> {
    return await this.baseTableRows.count();
  }

  async colCount(row: number): Promise<number> {
    const rowLocator = this.baseTableRows.nth(row - 1);
    return await rowLocator.locator("td").count();
  }

  async getSectionTitle(sectionRowKey: string): Promise<string> {
    const sectionAnchor = this.page.locator(
      `a.contentsAnchor[href*="sectionRowKey=${sectionRowKey}"]`
    );

    await sectionAnchor.waitFor({ state: "visible", timeout: 10000 });

    const sectionTitle = await sectionAnchor
      .locator(".contentsName")
      .innerText();

    return sectionTitle.trim();
  }

  async indexSectionKey(row: number) {
    const rowLocator = this.baseTableRows.nth(row - 1);
    const sectionLinkLocator = rowLocator.locator(
      "xpath=./td/table/tbody/tr/td[2]//a"
    );
    const sectionHref = await sectionLinkLocator.getAttribute("href", {
      timeout: 5000,
    });

    if (!sectionHref || sectionHref.length < 32) {
      throw new Error(`Section key retrieval failed for row ${row}`);
    }
    return sectionHref.slice(-32);
  }

  async indexSectionTitle(row: number): Promise<string> {
    const rowLocator = this.baseTableRows.nth(row - 1);
    const sectionTitleLocator = rowLocator.locator(
      "xpath=./td/table/tbody/tr/td[2]/a/div"
    );

    try {
      const sectionTitle = await sectionTitleLocator.textContent({
        timeout: 5000,
      });

      if (!sectionTitle || sectionTitle.trim() === "") {
        throw new Error(
          `Element found for row ${row}, but contained no visible section title.`
        );
      }

      const trimmedTitle = sectionTitle.trim();
      const doubleSpaceIndex = trimmedTitle.indexOf("  ");

      if (doubleSpaceIndex > 0) {
        return trimmedTitle.substring(0, doubleSpaceIndex);
      }

      return trimmedTitle;
    } catch {
      throw new Error(`Failed to retrieve section title for row ${row}`);
    }
  }

  async indexDocName(row: number): Promise<string> {
    // Target the 3rd column (td[3]) within the specific row
    const docNameLocator = this.baseTableRows
      .nth(row - 1)
      .locator("td")
      .nth(2);

    if (await docNameLocator.isVisible()) {
      let docName = await docNameLocator.textContent();

      if (docName) {
        docName = docName.slice(0, -14); // To remove Audit Trail from docName
        return docName ? docName.trim() : "No Name";
      }
    }
    return "No Name";
  }

  async indexDocNum(row: number): Promise<string> {
    // Target the 2nd column (td[2]) within the specific row
    const docNumLocator = this.baseTableRows
      .nth(row - 1)
      .locator("td")
      .nth(1);

    if (await docNumLocator.isVisible()) {
      let docNum = await docNumLocator.textContent();

      if (docNum) {
        docNum = docNum.trim();
        docNum = docNum.slice(0, -12); // To remove Audit Trail from docNum

        // This removes leading zeros unless the whole string is "0".
        return docNum.replace(/^0+(?!$)/, "");
      }
    }
    return "No Num";
  }

  async getIndexDocuments(): Promise<DocumentModel[]> {
    let sectionTitle: string | null = null;
    let sectionKey: string | null = null;
    const indexDocuments: DocumentModel[] = [];

    await this.indexTableLoad();
    const indexRowCount = await this.rowCount();

    for (let row = 1; row <= indexRowCount; row++) {
      const colCount = await this.colCount(row);

      // SECTION HEADER
      if (colCount < 4) {
        sectionTitle = await this.indexSectionTitle(row);
        sectionKey = await this.indexSectionKey(row);
      }

      // DOCUMENT DETAILS
      else if (colCount > 4) {
        const currentTitle = sectionTitle ?? "UNKNOWN SECTION TITLE";
        const currentKey = sectionKey ?? "UNKNOWN_KEY";

        const docName = await this.indexDocName(row);
        const docNum = await this.indexDocNum(row);

        indexDocuments.push({
          sectionTitle: currentTitle,
          sectionId: currentKey,
          documentName: docName,
          documentNumber: docNum,
        });
      }
    }
    return indexDocuments;
  }

  async validateIndexDocuments(
    expectedIndexDocuments: DocumentModel[],
    availableIndexDocuments: DocumentModel[]
  ) {
    // Check for missing expected sections/documents
    const missingDocuments: string[] = [];

    for (const expectedIndexDocument of expectedIndexDocuments) {
      const availableMatches = availableIndexDocuments.filter(
        (availableDocument) =>
          availableDocument.sectionTitle ===
            expectedIndexDocument.sectionTitle &&
          availableDocument.documentName ===
            expectedIndexDocument.documentName &&
          availableDocument.documentNumber ===
            expectedIndexDocument.documentNumber
      );
      if (availableMatches.length === 0) {
        missingDocuments.push(
          `Section Title: ${expectedIndexDocument.sectionTitle}, Document Name: ${expectedIndexDocument.documentName} - is missing from Index`
        );
      }
    }
    return missingDocuments;
  }

  async goToIndexSectionLink(sectionKey: string) {
    await this.indexTableLoad();
    const sectionLink = this.page.locator(
      `a.contentsAnchor[href*="sectionRowKey=${sectionKey}"]`
    );
    await expect(sectionLink).toBeVisible();
    await sectionLink.click();
  }
}
export default IndexPage;
