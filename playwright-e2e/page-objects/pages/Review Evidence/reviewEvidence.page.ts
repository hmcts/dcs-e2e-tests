import { expect } from "../../../fixtures";
import { Locator } from "@playwright/test";
import { Base } from "../../base";
import { DocumentModel, documents } from "../../../data/documentModel";
import NotesComponent from "./notesComponent";

/**
 * Represents the "Review Evidence" page, which is a core part of the application
 * for viewing and interacting with case documents. This Page Object
 * provides extensive functionalities for loading and validating sections and documents,
 * managing document Notes via the integrated `NotesComponent`, and verifying access controls.
 */

class ReviewEvidencePage extends Base {
  readonly sectionPanel: Locator;
  documentTextName: Locator;
  sections: Locator;
  caseName: Locator;
  notes: NotesComponent;

  constructor(page) {
    super(page);
    this.notes = new NotesComponent(page);
    this.sectionPanel = page.locator("#bundleIndexDiv");
    this.documentTextName = page.locator(".docTextName");
    this.sections = page.locator("li.sectionLi");
    this.caseName = page.locator(".caseName");
  }

  // ======================================================================
  // Review Evidence Index: Section Methods
  // ======================================================================

  /**
   * Waits for the section panel to load and become visible, specifically ensuring
   * that all "Please wait..." loaders within the panel have disappeared.
   * @param {number} [timeout=70000] - The maximum time to wait for the panel to load (in milliseconds).
   */
  async sectionPanelLoad(timeout = 70000) {
    const sectionPanel = this.page.locator("#bundleIndexDiv");
    await expect(sectionPanel).toBeVisible();
    // Wait until there are no visible loaders
    await this.page.waitForFunction(
      (panelSelector) => {
        const panel = document.querySelector(panelSelector);
        if (!panel) return false;

        return Array.from(
          panel.querySelectorAll('img[alt="Please wait ..."]'),
        ).every((img) => (img as HTMLElement).offsetParent === null); // cast to HTMLElement
      },
      "#bundleIndexDiv",
      { timeout },
    );
  }

  /**
   * Retrieves the total number of sections displayed in the section panel.
   */
  async getSectionsCount(): Promise<number> {
    await this.sections.first().waitFor({ state: "visible" });
    const count = await this.sectionPanel.locator(".sectionLi").count();
    if (count === 0) {
      throw new Error("No sections available to count");
    }
    return count;
  }

  /**
   * Retrieves the unique key of a section given its 0-based index in the panel.
   */
  async getSectionID(sectionIndex: number): Promise<string> {
    const section = this.sectionPanel.locator(".sectionLi").nth(sectionIndex);
    const sectionId = await section.getAttribute("id");

    if (!sectionId) {
      throw new Error(
        `Section at index ${sectionIndex} does not have an id attribute`,
      );
    }

    return sectionId;
  }

  /**
   * Retrieves the display name of a section given its unique key.
   */
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

  // ======================================================================
  // Review Evidence Index: Document Methods
  // ======================================================================

  /**
   * Retrieves the number of documents within a specific section using the section key.
   */
  async getDocumentCountPerSection(sectionId: string): Promise<number> {
    const sectionDocumentCount = await this.page
      .locator(`.sectionDocumentUl-${sectionId} > li`)
      .count();
    return sectionDocumentCount;
  }

  /**
   * Retrieves the document number for a specific document within a section.
   */
  async getDocumentNumber(
    documentIndex: number,
    sectionId: string,
  ): Promise<string> {
    const numberLocator = this.page
      .locator(`.sectionDocumentUl-${sectionId} .docTextIndex`)
      .nth(documentIndex);
    const locatorText = await numberLocator.innerText();
    if (!locatorText) {
      throw new Error(
        `No document number available for document index: ${documentIndex} of section ID: ${sectionId}`,
      );
    }
    const documentNumber = locatorText.charAt(0);
    return documentNumber;
  }

  /**
   * Retrieves the document name for a specific document within a section.
   */
  async getDocumentName(
    documentIndex: number,
    sectionId: string,
  ): Promise<string> {
    const name = await this.page
      .locator(`.sectionDocumentUl-${sectionId} .docTextName`)
      .nth(documentIndex)
      .innerText();
    if (!name) {
      throw new Error(
        `No document name available for document index: ${documentIndex} of Section ID: ${sectionId}`,
      );
    }
    // Remove any trailing "(...)" from the name
    const trailingParenthesis = name.lastIndexOf(" (");
    const cleanName =
      trailingParenthesis > -1 ? name.substring(0, trailingParenthesis) : name;
    return cleanName.trim();
  }

  /**
   * Retrieves the unique document key for a specific document within a section.
   */
  async getDocumentID(
    documentIndex: number,
    sectionId: string,
  ): Promise<string> {
    const documentId = await this.page
      .locator(`.sectionDocumentUl-${sectionId} .documentLi`)
      .nth(documentIndex)
      .getAttribute("id");
    if (!documentId)
      throw new Error(
        `Document at index ${documentIndex} in section ID: ${sectionId} not found`,
      );
    return documentId;
  }

  /**
   * Gathers all documents visible in the Review Evidence panel for a given user.
   * Iterates through all sections and their documents to create a list of `DocumentModel` objects.
   * @returns {Promise<DocumentModel[]>} An array of `DocumentModel` objects representing all visible documents.
   */
  async getDocuments(user: string): Promise<DocumentModel[]> {
    const documents: DocumentModel[] = [];

    const sectionCount = await this.getSectionsCount();

    for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
      const sectionId = await this.getSectionID(sectionIndex);
      const sectionName = await this.getSectionName(sectionId);

      const documentCount = await this.getDocumentCountPerSection(sectionId);

      if (documentCount === 0) {
        documents.push({
          sectionTitle: sectionName,
          sectionId,
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
            sectionId,
          );
          const documentNumber = await this.getDocumentNumber(
            documentIndex,
            sectionId,
          );
          const documentId = await this.getDocumentID(documentIndex, sectionId);

          documents.push({
            sectionTitle: sectionName,
            sectionId,
            documentName: documentName,
            documentNumber: documentNumber,
            documentId: documentId,
            roles: [user],
          });
        }
      }
    }

    return documents;
  }

  /**
   * Filters the global list of documents (`../../../data/documentModel.ts`)
   * to find those accessible by a specific user role.
   * @returns {DocumentModel[]} An array of `DocumentModel` objects accessible by the specified user.
   */
  async filterDocumentsByUser(user: string) {
    const filteredDocuments = documents.filter((document) =>
      document.roles?.includes(user),
    );
    return filteredDocuments;
  }

  /**
   * Compares a list of expected documents for a user against documents actually found in the UI.
   * Identifies and reports any missing expected documents or unexpected extra documents.
   * @param {DocumentModel[]} userExpectedDocuments - An array of `DocumentModel` objects expected to be visible for the user.
   * @param {DocumentModel[]} userAvailableDocuments - An array of `DocumentModel` objects actually found for the user in the UI.
   * @returns {{missingDocuments: string[], unexpectedDocuments: string[]}} An object containing arrays of descriptions for missing
   * and unexpected documents.
   */
  async compareExpectedVsAvailableSectionsAndDocuments(
    userExpectedDocuments: DocumentModel[],
    userAvailableDocuments: DocumentModel[],
  ) {
    const missingDocuments: string[] = [];
    const unexpectedDocuments: string[] = [];

    // Check for missing expected sections/documents

    for (const expectedDocument of userExpectedDocuments) {
      const availableMatches = userAvailableDocuments.filter(
        (availableDocument) =>
          availableDocument.sectionTitle === expectedDocument.sectionTitle &&
          availableDocument.documentName === expectedDocument.documentName &&
          availableDocument.documentNumber === expectedDocument.documentNumber,
      );
      if (availableMatches.length === 0) {
        missingDocuments.push(
          `Section Title: ${expectedDocument.sectionTitle}, Document Name: ${expectedDocument.documentName} - is missing`,
        );
      }
    }

    // Check for unexpected access to sections/documents

    for (const availableDocument of userAvailableDocuments) {
      const expectedMatches = userExpectedDocuments.filter(
        (expectedDocument) =>
          expectedDocument.sectionTitle === availableDocument.sectionTitle &&
          expectedDocument.documentName === availableDocument.documentName &&
          expectedDocument.documentNumber === availableDocument.documentNumber,
      );
      if (expectedMatches.length === 0) {
        unexpectedDocuments.push(
          `Section Title: ${availableDocument.sectionTitle}, Document Name: ${availableDocument.documentName} - is unexpectedly showing`,
        );
      }
    }
    return { missingDocuments, unexpectedDocuments };
  }

  // ======================================================================
  // Review Evidence Index: Document Render Methods
  // ======================================================================

  /**
   * Standardizes a document's file name for screenshot comparison purposes.
   * Removes leading numbers/symbols and converts to a lowercase, underscore-separated format.
   * @param {Locator} documentLink - The Playwright Locator for the document link.
   * @returns {Promise<string>} The standardized file name appended with "_page1.png".
   */
  async standardiseFileName(documentLink: Locator): Promise<string> {
    const nameLocator = documentLink.locator(".docTextName");
    const name = await nameLocator.innerText();
    name.replace(/^\s*\d+[:\-\s]*/, "");
    name.replace(/[^a-z0-9_\-]/gi, "_").toLowerCase();
    const screenshotName = `${name}_page1.png`;
    return screenshotName;
  }

  /**
   * Retrieves the Locator for a document's image element.
   * @returns {Locator} A Playwright Locator for the image associated with the document.
   */
  getImageLocator(docId: string): Locator {
    const image = this.page.locator(`#canvas-${docId}-1`);
    return image;
  }

  /**
   * Waits for the high-resolution image of a document to load in the viewer - critical before
   * snapshots can be taken.
   * This method uses `page.evaluate` to listen for the image's `load` event.
   */
  async waitForHighResImageLoad(
    docId: string,
    docName: string,
    user: string,
    index: number,
    sectionTitle: string,
    sampleSize: number,
    timeoutMs = 45000,
  ) {
    const result = await this.page.evaluate(
      ({
        documentId,
        documentName,
        user,
        index,
        sectionTitle,
        sampleSize,
        timeout,
      }) => {
        const img = document.querySelector<HTMLImageElement>(
          `img.documentPageImage[data-documentrowkey="${documentId}"]`,
        );
        if (!img)
          return {
            success: false,
            message: `${user}: ${
              index + 1
            }/${sampleSize} ❌ Image not found for Document: ${documentName} in Section: ${sectionTitle}`,
          };

        return new Promise<{ success: boolean; message: string }>((resolve) => {
          const handler = () => {
            if (img.src.includes("r=i")) {
              img.removeEventListener("load", handler);
              resolve({
                success: true,
                message: `${user}: ${
                  index + 1
                }/${sampleSize} ✅ High-res image loaded for Document: ${documentName} in Section: ${sectionTitle}`,
              });
            }
          };
          img.addEventListener("load", handler);

          setTimeout(() => {
            img.removeEventListener("load", handler);
            resolve({
              success: false,
              message: `${user}: ${
                index + 1
              }/${sampleSize} ⚠️ Timeout (${timeout}ms) waiting for high-res image for Document: ${documentName} in Section: ${sectionTitle}`,
            });
          }, timeout);
        });
      },
      {
        documentId: docId,
        documentName: docName,
        user: user,
        index: index,
        sectionTitle: sectionTitle,
        sampleSize: sampleSize,
        timeout: timeoutMs,
      },
    );

    // Node-side console log
    console.log(result.message);

    if (!result.success) {
      throw new Error(result.message);
    }
  }
}

export default ReviewEvidencePage;
