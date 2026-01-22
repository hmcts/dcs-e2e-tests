import { Base } from "../base";
import { Locator } from "playwright-core";
import { ROCAModel } from "../../data/ROCAModel";
import { expect } from "../../fixtures";
import { sections } from "../../utils";

/**
 * Represents the "Record of Case Activity" (ROCA) page, which logs actions
 * performed on cases and documents. This Page Object provides locators and
 * methods to interact with ROCA tables, create and update ROCA model records,
 * retrieve documents from ROCA tables, and compare/validate expected vs. actual
 * ROCA entries.
 */
class ROCAPage extends Base {
  unrestrictedTable: Locator;
  restrictedTable: Locator;
  splitAction: Locator;
  mergeAction: Locator;
  unrestrDocRoca: Locator;
  defARestrDocRoca: Locator;
  defBRestrDocRoca: Locator;

  constructor(page) {
    super(page);
    this.unrestrictedTable = page.locator("#rodaDiv table").nth(0);
    this.restrictedTable = page.locator("#rodaDiv table").nth(1);
    this.splitAction = page.getByText('Index: Split', { exact: true })
    this.mergeAction = page.getByText('Index: Merge', { exact: true })    
    this.unrestrDocRoca = page.getByText('Name: unrestrictedSectionUpload', { exact: true })
    this.defARestrDocRoca = page.getByText('Name: restrictedSectionUploadDefendantOne', { exact: true })
    this.defBRestrDocRoca = page.getByText('Name: restrictedSectionUploadDefendantTwo', { exact: true })
  }

  /**
   * Creates and adds a new ROCA model record to an array of uploaded documents.
   * This is used to build a list of expected ROCA entries for validation.
   * @param uploadedDocuments - The array to which the new ROCA record will be added.
   * @returns The updated array of ROCA model records.
   */
  async createROCAModelRecord(
    uploadedDocuments: ROCAModel[],
    sectionIndex: string,
    documentName: string,
    action: string,
    username: string,
    defendants?: string
  ): Promise<ROCAModel[]> {
    // Count how many existing docs in a section already exist
    const existingDocs = uploadedDocuments.filter(
      (d) => d.sectionIndex === sectionIndex
    );
    const nextNumber = (existingDocs.length + 1).toString();

    // Build new document entry
    const newDocument: ROCAModel = {
      sectionIndex,
      documentNumber: nextNumber,
      documentName,
      action,
      username,
      defendants,
    };

    uploadedDocuments.push(newDocument);

    return uploadedDocuments;
  }

  /**
   * Updates an existing ROCA model record or adds a new one for update/delete actions.
   * Finds a document by section index and name, then records an update or delete action.
   * @param uploadedDocuments - The array of ROCA records to update.
   * @returns The updated array of ROCA model records.
   */
  async updateROCAModel(
    uploadedDocuments: ROCAModel[],
    sectionIndex: string,
    documentName: string,
    action: string,
    username: string,
    defendants?: string
  ): Promise<ROCAModel[]> {
    // Find existing record
    const existingDoc = uploadedDocuments.find(
      (d) => d.sectionIndex === sectionIndex && d.documentName === documentName
    );
    if (!existingDoc) {
      throw new Error(
        `ROCA Model: Could not find existing record for Section: ${sectionIndex}/ Document: ${documentName}`
      );
    }

    // Build new document record for document update
    if (action === "Delete") {
      const newDocument: ROCAModel = {
        sectionIndex,
        documentNumber: existingDoc?.documentNumber,
        documentName,
        action,
        username,
        defendants,
      };
      uploadedDocuments.push(newDocument);
    } else {
      const newDocument: ROCAModel = {
        sectionIndex,
        documentNumber: existingDoc?.documentNumber,
        documentName: "TestEdit",
        action,
        username,
        defendants,
      };
      uploadedDocuments.push(newDocument);
    }

    return uploadedDocuments;
  }

  /**
   * Updates the ROCA model to reflect a document move between sections.
   * Records a "Delete" action for the original location and a "Create" action
   * for the new location, adjusting defendant associations based on restriction.
   */
  async updateROCAModelMove(
    uploadedDocuments: ROCAModel[],
    sectionIndex: string,
    newSectionIndex: string,
    documentName: string,
    username: string,
    rocaModel: ROCAModel[],
    isRestrictedContext: boolean,
    defendants?: string
  ) {
    // Find existing record
    const existingDoc = uploadedDocuments.find(
      (d) => d.sectionIndex === sectionIndex && d.documentName === documentName
    );
    if (!existingDoc) {
      throw new Error(
        `ROCA Model: Could not find existing record for Section: ${sectionIndex}/ Document: ${documentName}`
      );
    }
    // Build new document record for document deletion
    const deletionRecord: ROCAModel = {
      sectionIndex,
      documentNumber: existingDoc?.documentNumber,
      documentName,
      action: "Delete",
      username,
      defendants,
    };
    uploadedDocuments.push(deletionRecord);

    // Build new document record for the document in its new section
    const newRecord: ROCAModel = {
      sectionIndex: newSectionIndex,
      documentNumber: existingDoc?.documentNumber,
      documentName,
      action: "Create",
      username,
      defendants,
    };

    const targetIsRestricted = sections.restricted.includes(newSectionIndex);

    if (isRestrictedContext) {
      // 🔹 Restricted → Restricted
      if (targetIsRestricted) {
        uploadedDocuments.push(newRecord);
      }
      // 🔹 Restricted → Unrestricted
      else {
        newRecord.defendants = undefined;
        rocaModel.push(newRecord);
      }
    } else {
      // 🔹 Unrestricted → Restricted
      if (targetIsRestricted) {
        newRecord.defendants = "";
        rocaModel.push(newRecord);
      }
      // 🔹 Unrestricted → Unrestricted
      else {
        uploadedDocuments.push(newRecord);
      }
    }
  }

  /**
   * Retrieves all ROCA entries from a specified ROCA table locator.
   * Parses the table rows to extract document details, action, username, and defendant information.
   * @param tableLocator - The Playwright Locator for the ROCA table (e.g., unrestrictedTable or restrictedTable).
   * @returns An array of `ROCAModel` objects representing the entries in the table.
   */
  async getDocumentsFromROCATable(tableLocator: Locator): Promise<ROCAModel[]> {
    const docs: ROCAModel[] = [];
    const rows = tableLocator.locator("tbody tr");
    const rowCount = await rows.count();

    for (let i = 1; i < rowCount; i++) {
      const row = rows.nth(i);

      const hasIndex = await row.locator('div:has-text("Index:")').count();
      if (hasIndex === 0) continue;

      const fullName = await row.locator("td:nth-child(1)").innerText();
      const username = fullName.match(/\b(\w+)\s*$/)?.[1] ?? fullName;

      const action = await row.locator("td:nth-child(2)").innerText();

      const sectionIndex = (
        await row.locator("td:nth-child(3) div:nth-child(1)").innerText()
      )
        .replace("Section:", "")
        .trim();

      let documentNumber = (
        await row.locator("td:nth-child(3) div:nth-child(2)").innerText()
      )
        .replace("Index:", "")
        .trim();

      const documentName = (
        await row.locator("td:nth-child(3) div:nth-child(3)").innerText()
      )
        .replace("Name:", "")
        .trim();

      let defendants: string | undefined;
      if (tableLocator === this.restrictedTable) {
        defendants = await row.locator("td:nth-child(5)").innerText();
      } else {
        defendants = undefined;
      }

      if (/^\d+$/.test(documentNumber)) {
        documentNumber = String(parseInt(documentNumber, 10)); // "001" → "1"
        docs.push({
          sectionIndex,
          documentNumber,
          documentName,
          action,
          username,
          defendants,
        });
      }
    }
    return docs;
  }

  /**
   * Compares a list of expected ROCA entries against actual entries found in the UI.
   * Identifies and reports any missing expected documents or unexpected extra documents.
   * @param expectedDocs - An array of `ROCAModel` objects representing the expected ROCA entries.
   * @param actualDocs - An array of `ROCAModel` objects representing the actual ROCA entries from the UI.
   * @returns An object containing arrays of descriptions for missing and unexpected documents.
   */
  async compareExpectedVsAvailableROCA(
    expectedDocs: ROCAModel[],
    actualDocs: ROCAModel[]
  ) {
    const missingDocuments: string[] = [];
    const unexpectedDocuments: string[] = [];

    // Check for missing expected sections/documents

    for (const expected of expectedDocs) {
      const found = actualDocs.some(
        (actual) =>
          actual.sectionIndex === expected.sectionIndex &&
          actual.documentNumber === expected.documentNumber &&
          actual.documentName === expected.documentName &&
          actual.action === expected.action &&
          actual.username === expected.username &&
          actual.defendants === expected.defendants
      );
      if (!found) {
        missingDocuments.push(
          `Missing Record 
          EXPECTED:
          Section: ${expected.sectionIndex}
          Document: ${expected.documentName}(${expected.documentNumber})
          Action: ${expected.action}
          Username: ${expected.username}
          Defendants: ${expected.defendants}`
        );
      }
    }

    // Check for unexpected access to sections/documents

    for (const actual of actualDocs) {
      const found = expectedDocs.some(
        (expected) =>
          expected.sectionIndex === actual.sectionIndex &&
          expected.documentNumber === actual.documentNumber &&
          expected.documentName === actual.documentName &&
          expected.action === actual.action &&
          expected.username === actual.username &&
          expected.defendants === actual.defendants
      );
      if (!found) {
        unexpectedDocuments.push(
          `Unexpected Record
          FOUND:
          Section: ${actual.sectionIndex}
          Document: ${actual.documentName} (${actual.documentNumber})
          Action: ${actual.action}
          Username: ${actual.username}
          Defendants: ${actual.defendants}`
        );
      }
    }

    return { missingDocuments, unexpectedDocuments };
  }

  /**
   * Validates the ROCA tables against a list of expected ROCA entries for a specific user.
   * @returns An array of strings describing any discrepancies found during validation.
   */
  async validateROCAForUser(expectedROCA: ROCAModel[], tableLocator: Locator) {
    await expect(tableLocator).toBeVisible();

    const availableROCA = await this.getDocumentsFromROCATable(tableLocator);

    const { missingDocuments, unexpectedDocuments } =
      await this.compareExpectedVsAvailableROCA(expectedROCA, availableROCA);

    return [...missingDocuments, ...unexpectedDocuments];
  }
  
  /**
   * Waits for both the unrestricted and restricted ROCA tables to be visible,
   * indicating that the ROCA page content has fully loaded.
   */
  async waitForRocaTablesToLoad(){
    await this.unrestrictedTable.waitFor({ state: 'visible', timeout: 40000 });
    await this.restrictedTable.waitFor({ state: 'visible', timeout: 40000 });
  }
}
export default ROCAPage;
