import { Locator } from "@playwright/test";
import { Base } from "../base";
import { DocumentModel, documents } from "../../data/documentModel";

class ReviewEvidencePage extends Base {
  readonly sectionPanel: Locator;
  documentTextName: Locator;
  sections: Locator;

  constructor(page) {
    super(page);
    this.sectionPanel = page.locator("#bundleIndexDiv");
    this.documentTextName = page.locator(".docTextName");
    this.sections = page.locator("li.sectionLi");
  }

  // Review Evidence Index: Section Methods

  async getSectionsCount(): Promise<number> {
    await this.sections.first().waitFor({ state: "visible" });
    const count = await this.sectionPanel.locator(".sectionLi").count();
    if (count === 0) {
      throw new Error("No sections available to count");
    }
    return count;
  }

  async getSectionID(sectionIndex: number): Promise<string> {
    const section = this.sectionPanel.locator(".sectionLi").nth(sectionIndex);
    const sectionId = await section.getAttribute("id");

    if (!sectionId) {
      throw new Error(
        `Section at index ${sectionIndex} does not have an id attribute`
      );
    }

    return sectionId;
  }

  async getSectionName(sectionId: string): Promise<string> {
    const fullTitle = await this.page
      .locator(`#sectionName-${sectionId} .sectionTextName`)
      .innerText();

    if (!fullTitle) {
      throw new Error(`No name available at Section ID: ${sectionId}`);
    }
    // Remove any "(Restricted ...)" suffix from the section title
    const [sectionName] = fullTitle.split(/\s\(Restricted/);
    return sectionName.trim();
  }

  // Review Evidence Index: Document Methods

  async getDocumentCountPerSection(sectionId: string): Promise<number> {
    const sectionDocumentCount = await this.page
      .locator(`.sectionDocumentUl-${sectionId} > li`)
      .count();
    return sectionDocumentCount;
  }

  async getDocumentNumber(
    documentIndex: number,
    sectionId: string
  ): Promise<string> {
    const numberLocator = this.page
      .locator(`.sectionDocumentUl-${sectionId} .docTextIndex`)
      .nth(documentIndex);
    const locatorText = await numberLocator.innerText();
    if (!locatorText) {
      throw new Error(
        `No document number available for document index: ${documentIndex} of section ID: ${sectionId}`
      );
    }
    const documentNumber = locatorText.charAt(0);
    return documentNumber;
  }

  async getDocumentName(
    documentIndex: number,
    sectionId: string
  ): Promise<string> {
    const name = await this.page
      .locator(`.sectionDocumentUl-${sectionId} .docTextName`)
      .nth(documentIndex)
      .innerText();
    if (!name) {
      throw new Error(
        `No document name available for document index: ${documentIndex} of Section ID: ${sectionId}`
      );
    }
    // Remove any trailing "(...)" from the name
    const trailingParenthesis = name.lastIndexOf(" (");
    const cleanName =
      trailingParenthesis > -1 ? name.substring(0, trailingParenthesis) : name;
    return cleanName.trim();
  }

  async getDocumentID(
    documentIndex: number,
    sectionId: string
  ): Promise<string> {
    const documentId = await this.page
      .locator(`.sectionDocumentUl-${sectionId} .documentLi`)
      .nth(documentIndex)
      .getAttribute("id");
    if (!documentId)
      throw new Error(
        `Document at index ${documentIndex} in section ID: ${sectionId} not found`
      );
    return documentId;
  }

  async getDocuments(user: string): Promise<DocumentModel[]> {
    const documents: DocumentModel[] = [];

    const sectionCount = await this.getSectionsCount();

    for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
      const sectionID = await this.getSectionID(sectionIndex);
      const sectionName = await this.getSectionName(sectionID);

      const documentCount = await this.getDocumentCountPerSection(sectionID);

      if (documentCount === 0) {
        documents.push({
          sectionTitle: sectionName,
          documentName: "No available document: name",
          documentNumber: "No available document: number",
          roles: [user],
        });
      } else {
        for (
          let documentIndex = 0;
          documentIndex < documentCount;
          documentIndex++
        ) {
          const documentName = await this.getDocumentName(
            documentIndex,
            sectionID
          );
          const documentNumber = await this.getDocumentNumber(
            documentIndex,
            sectionID
          );

          documents.push({
            sectionTitle: sectionName,
            documentName: documentName,
            documentNumber: documentNumber,
            roles: [user],
          });
        }
      }
    }

    return documents;
  }

  async filterDocumentsByUser(user: string) {
    const filteredDocuments = documents.filter((document) =>
      document.roles?.includes(user)
    );
    return filteredDocuments;
  }

  async compareExpectedVsAvailableSectionsAndDocuments(
    userExpectedDocuments: DocumentModel[],
    userAvailableDocuments: DocumentModel[]
  ) {
    const missingDocuments: string[] = [];
    const unexpectedDocuments: string[] = [];

    // Check for missing expected sections/documents

    for (const expectedDocument of userExpectedDocuments) {
      const availableMatches = userAvailableDocuments.filter(
        (availableDocument) =>
          availableDocument.sectionTitle === expectedDocument.sectionTitle &&
          availableDocument.documentName === expectedDocument.documentName &&
          availableDocument.documentNumber === expectedDocument.documentNumber
      );
      if (availableMatches.length === 0) {
        missingDocuments.push(
          `"${expectedDocument.documentName}" (${expectedDocument.documentNumber}) in section "${expectedDocument.sectionTitle}"`
        );
      }
    }

    // Check for unexpected access to sections/documents

    for (const availableDocument of userAvailableDocuments) {
      const expectedMatches = userExpectedDocuments.filter(
        (expectedDocument) =>
          expectedDocument.sectionTitle === availableDocument.sectionTitle &&
          expectedDocument.documentName === availableDocument.documentName &&
          expectedDocument.documentNumber === availableDocument.documentNumber
      );
      if (expectedMatches.length === 0) {
        unexpectedDocuments.push(
          `"${availableDocument.documentName}" (${availableDocument.documentNumber}) in section "${availableDocument.sectionTitle}"`
        );
      }
      if (missingDocuments.length > 0) {
        throw new Error(
          `Missing documents/sections:\n- ${missingDocuments.join("\n- ")}\n`
        );
      }
      if (unexpectedDocuments.length > 0) {
        throw new Error(
          `Unexpected documents/sections:\n- ${unexpectedDocuments.join(
            "\n- "
          )}`
        );
      }
    }
  }

  async getAllDocumentNames() {
    const documentLinks = this.documentTextName;
    return documentLinks;
  }

  async getAllDocumentIds(): Promise<string[]> {
    const documentIds: string[] = [];

    const sectionCount = await this.getSectionsCount();

    for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
      const sectionID = await this.getSectionID(sectionIndex);
      const sectionName = await this.getSectionName(sectionID);
      const documentCount = await this.getDocumentCountPerSection(sectionID);

      if (documentCount === 0) {
        console.log(`no document id available for section: ${sectionName}`);
      } else {
        for (let i = 0; i < documentCount; i++) {
          const documentId = await this.getDocumentID(i, sectionID);

          documentIds.push(documentId);
        }
      }
    }

    return documentIds;
  }

  async standardiseFileName(documentLink: Locator): Promise<string> {
    const name = await documentLink.innerText();
    name.replace(/[^a-z0-9_\-]/gi, "_").toLowerCase();
    const screenshotName = `${name}_page1.png`;
    return screenshotName;
  }

  async waitForAllDocumentLinksToLoad(documentLinks: Locator) {
    await documentLinks.first().waitFor({ state: "visible" });
    let lastCount = 0;
    for (let i = 0; i < 10; i++) {
      const count = await documentLinks.count();
      if (count === lastCount && count > 0) break;
      lastCount = count;
    }
  }

  getImageLocator(docId: string): Locator {
    const image = this.page.locator(`#canvas-${docId}-1`);
    return image;
  }

  async trackHighResImageLoad() {
    // Expose a function to the page that updates the last high resolution loaded document
    await this.page.exposeFunction("notifyHighResLoaded", (docId: string) => {
      (window as any).__lastHighResDoc = docId;
    });

    // Override the page's highResImageLoaded function to track docId
    await this.page.evaluate(() => {
      const original = (window as any).highResImageLoaded;
      (window as any).highResImageLoaded = function (
        docId: string,
        sectionId: string,
        pageNumber: string
      ) {
        if (original) original(docId, sectionId, pageNumber); // Call original function
        (window as any).notifyHighResLoaded(docId); // Track docId
        (window as any).__lastHighResDoc = docId; // Store last docId
      };
    });
  }

  async waitForHighResImageLoad(docId: string) {
    await this.page.waitForFunction(
      (targetDocId) => (window as any).__lastHighResDoc === targetDocId,
      docId,
      { timeout: 20000 }
    );
  }
}

export default ReviewEvidencePage;
