import { Base } from "../base";
import { Locator } from "playwright-core";
import { ROCAModel } from "../../data/ROCAModel";
import { expect } from "../../fixtures";
import { sections } from "../../utils";

class ROCAPage extends Base {
  unrestrictedTable: Locator;
  restrictedTable: Locator;

  constructor(page) {
    super(page);
    this.unrestrictedTable = page.locator("#rodaDiv table").nth(0);
    this.restrictedTable = page.locator("#rodaDiv table").nth(1);
  }

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

  // Document Comparison

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
          `Missing Record - Section: ${expected.sectionIndex} / Document: ${expected.documentName}(${expected.documentNumber})`
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
          `Unexpected Record - Section: ${actual.sectionIndex} / Document: ${actual.documentName}(${actual.documentNumber})`
        );
      }
    }

    return { missingDocuments, unexpectedDocuments };
  }

  async validateROCAForUser(expectedROCA: ROCAModel[], tableLocator: Locator) {
    await expect(tableLocator).toBeVisible();

    const availableROCA = await this.getDocumentsFromROCATable(tableLocator);
    console.log("AVAILABLE", availableROCA);

    const { missingDocuments, unexpectedDocuments } =
      await this.compareExpectedVsAvailableROCA(expectedROCA, availableROCA);

    return [...missingDocuments, ...unexpectedDocuments];
  }
}

export default ROCAPage;
