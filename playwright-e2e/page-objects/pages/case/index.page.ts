import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { DocumentModel } from "../../../data/documentModel";
import UploadDocumentPage from "./uploadDocument.page";
import { expect } from "../../../fixtures";

/**
 * Represents the "Index" page within a case, which provides an overview of
 * all documents and sections. This Page Object facilitates interaction with
 * the index table, including validating document presence, structure,
 * and navigation to specific sections or documents.
 */
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
      'xpath=//*[@id="aspnetForm"]/table[2]/tbody/tr',
    );
    this.sectionLinks = page.locator("a.contentsAnchor");
    this.pd1SectionLocator = page.getByText("PD1:", { exact: true });
    this.pd2SectionLocator = page.getByText("PD2:", { exact: true });
  }

  /**
   * Waits for the index table to finish loading, specifically waiting for
   * any 'working' spinners to disappear.
   */
  async indexTableLoad() {
    const indexTable = this.page.locator(".fullContents");
    const loaders = indexTable.locator(
      'img[alt="working"][src*="spinning/wait16trans.gif"]:visible',
    );
    await expect(loaders).toHaveCount(0, { timeout: 180_000 });
    console.log("Successful load of Index Table");
  }

  /**
   * Returns the total number of rows found in the base index table.
   */
  async rowCount(): Promise<number> {
    return await this.baseTableRows.count();
  }

  /**
   * Returns the number of columns in a specific row of the base index table.
   */
  async colCount(row: number): Promise<number> {
    const rowLocator = this.baseTableRows.nth(row - 1);
    return await rowLocator.locator("td").count();
  }

  /**
   * Retrieves the title of a section given its section row key.
   * @param {string} sectionRowKey - The unique key identifying the section row.
   * @returns {Promise<string>} The trimmed title of the section.
   */
  async getSectionTitle(sectionRowKey: string): Promise<string> {
    const sectionAnchor = this.page.locator(
      `a.contentsAnchor[href*="sectionRowKey=${sectionRowKey}"]`,
    );

    await sectionAnchor.waitFor({ state: "visible", timeout: 10000 });

    const sectionTitle = await sectionAnchor
      .locator(".contentsName")
      .innerText();

    return sectionTitle.trim();
  }

  /**
   * Extracts the section key from a specific row in the index table.
   * @returns {Promise<string>} The 32-character section key.
   */
  async indexSectionKey(row: number) {
    const rowLocator = this.baseTableRows.nth(row - 1);
    const sectionLinkLocator = rowLocator.locator(
      "xpath=./td/table/tbody/tr/td[2]//a",
    );
    const sectionHref = await sectionLinkLocator.getAttribute("href", {
      timeout: 5000,
    });

    if (!sectionHref || sectionHref.length < 32) {
      throw new Error(`Section key retrieval failed for row ${row}`);
    }
    return sectionHref.slice(-32);
  }

  /**
   * Retrieves the title of a section from a specific row in the index table.
   * @returns {Promise<string>} The trimmed section title.
   */
  async indexSectionTitle(row: number): Promise<string> {
    const rowLocator = this.baseTableRows.nth(row - 1);
    const sectionTitleLocator = rowLocator.locator(
      "xpath=./td/table/tbody/tr/td[2]/a/div",
    );

    try {
      const sectionTitle = await sectionTitleLocator.textContent({
        timeout: 5000,
      });

      if (!sectionTitle || sectionTitle.trim() === "") {
        throw new Error(
          `Element found for row ${row}, but contained no visible section title.`,
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

  /**
   * Retrieves the name of a document from a specific row in the index table.
   * @returns {Promise<string>} The trimmed document name, or "No Name" if not found.
   */
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

  /**
   * Retrieves the number of a document from a specific row in the index table.
   * @returns {Promise<string>} The trimmed document number (with leading zeros removed), or "No Num" if not found.
   */
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

  /**
   * Gathers all visible documents and their associated section information from the index table.
   * @returns {Promise<DocumentModel[]>} An array of `DocumentModel` objects representing the documents in the index.
   */
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

  /**
   * Validates that all expected documents are present in the available index documents.
   * @param {DocumentModel[]} expectedIndexDocuments - An array of documents expected to be in the index.
   * @param {DocumentModel[]} availableIndexDocuments - An array of documents actually found in the index.
   * @returns {Promise<string[]>} An array of strings describing any missing documents.
   */
  async validateIndexDocuments(
    expectedIndexDocuments: DocumentModel[],
    availableIndexDocuments: DocumentModel[],
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
            expectedIndexDocument.documentNumber,
      );
      if (availableMatches.length === 0) {
        missingDocuments.push(
          `Section Title: ${expectedIndexDocument.sectionTitle}, Document Name: ${expectedIndexDocument.documentName} - is missing from Index`,
        );
      }
    }
    return missingDocuments;
  }

  /**
   * Clicks on a section link in the index table to navigate to that section's details.
   */
  async goToIndexSectionLink(sectionKey: string) {
    await this.indexTableLoad();
    const sectionLink = this.page.locator(
      `a.contentsAnchor[href*="sectionRowKey=${sectionKey}"]`,
    );
    await expect(sectionLink).toBeVisible();
    await sectionLink.click();
  }

  /**
   * Validates the presence of a specific document within a section in the index.
   */
  async validateIndexDocument(filename, section) {
    const sectionCell = this.page.locator(
      "table.sectionHeadTable td.tableText",
      {
        has: this.page.getByText(`${section}:`, { exact: true }),
      },
    );
    const sectionRow = sectionCell.locator("xpath=ancestor::tr");
    const documentRow = sectionRow.locator("xpath=following-sibling::tr[1]");
    const tdCount = await documentRow.locator("td").count();
    expect(tdCount).toBeGreaterThan(4);
    await expect(documentRow).toContainText(`${filename}`);
  }

  /**
   * Validates that a restricted document is NOT accessible or visible in the index.
   */
  async validateNoAccessToRestrictedIndexDocument(filename) {
    const contentsTable = this.page.locator(".fullContents > tbody");
    await expect(contentsTable).not.toContainText(`${filename}:`);
  }

  /**
   * Validates the presence of specific sections in the index table.
   * @param {string[]} sections - An array of section names to validate.
   */
  async validateSections(sections: string[]) {
    for (const section of sections) {
      const cellLocator = this.page.getByRole("cell", {
        name: `${section}:`,
        exact: true,
      });
      await expect(cellLocator).toBeVisible();
    }
  }

  async validateSectionsMissing(sections: string[]) {
    for (const section of sections) {
      const cellLocator = this.page.getByRole("cell", {
        name: `${section}:`,
        exact: true,
      });
      await expect(cellLocator).toBeHidden();
    }
  }
}
export default IndexPage;
