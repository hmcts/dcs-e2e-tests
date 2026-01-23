import { Base } from "../../base";
import { DocumentModel } from "../../../data/documentModel";
import ViewDocumentPage from "./viewDocument.page";
import { expect } from "../../../fixtures";
import { Locator } from "playwright-core";

interface DocumentCheck {
  name: string;
  shouldBeVisible: boolean;
}

/**
 * Represents the page displaying documents within a specific section of a case.
 * This Page Object provides functionalities to load the section documents table,
 * verify document presence, handle restricted document access, and navigate
 * to document upload.
 */
class SectionDocumentsPage extends Base {
  readonly viewDocumentPage: ViewDocumentPage;
  sectionDocumentsLoader: Locator;
  sectionsTable: Locator;

  constructor(page) {
    super(page);
    this.viewDocumentPage = new ViewDocumentPage(page);
    this.sectionDocumentsLoader = page.locator("i", {
      hasText: "Fetching detail ...",
    });
    this.sectionsTable = page.locator(".formTable-zebra");
  }

  /**
   * Waits for the section documents table to load, ensuring the loader is no longer visible.
   */
  async sectionTableLoad() {
    await expect
      .poll(
        async () => {
          const loaderVisible = await this.sectionDocumentsLoader.isVisible();
          const tableVisible = await this.sectionsTable.isVisible();
          return !loaderVisible && tableVisible;
        },
        {
          timeout: 30000,
          message: "Waiting for loader to disappear and table to be visible",
        },
      )
      .toBe(true);
  }

  /**
   * Verifies that a document has been successfully removed from a section.
   * @returns A string message if removal verification fails, otherwise void.
   */
  async verifyDocumentRemoval(user, section) {
    await this.sectionTableLoad();
    await this.page
      .locator("table.formTable-zebra tbody tr:nth-child(n+2)")
      .first()
      .waitFor({ state: "visible", timeout: 40000 });
    const rows = this.page.locator(
      "table.formTable-zebra tbody tr:nth-child(n+3)",
    );
    const count = await rows.count();
    if (count > 0) {
      return `Document removal failed for ${user} in Section ${section}`;
    }
  }

  /**
   * Retrieves a list of documents present in the current section's table.
   * @returns An array of `DocumentModel` objects representing the documents in the section.
   */
  async getSectionDocuments(
    sectionId: string,
    sectionName: string,
  ): Promise<DocumentModel[]> {
    const documents: DocumentModel[] = [];
    await this.page
      .locator("table.formTable-zebra tbody tr:nth-child(n+2)")
      .first()
      .waitFor({ state: "visible", timeout: 40000 });
    const rows = this.page.locator(
      "table.formTable-zebra tbody tr:nth-child(n+3)",
    );
    const count = await rows.count();

    if (count === 0) {
      documents.push({
        sectionTitle: sectionName,
        sectionId: sectionId,
        documentName: "No available document: name",
        documentNumber: "No available document: number",
      });
      return documents;
    }

    for (let i = 0; i < count; i++) {
      const documentName = await rows
        .nth(i)
        .locator("td:nth-child(4) > span:not([class^='documentRedacted'])")
        .innerText();

      const documentNumber = await rows
        .nth(i)
        .locator("td:nth-child(3)")
        .innerText();
      let docNumber = documentNumber.slice(0, -1);
      docNumber = docNumber.replace(/^0+(?!$)/, "");

      documents.push({
        sectionTitle: sectionName,
        sectionId: sectionId,
        documentName: documentName.trim(),
        documentNumber: docNumber.trim(),
      });
    }
    return documents;
  }

  /**
   * Verifies that all documents listed in the section table can be opened in a popup
   * and that the popup URL is correct.
   */
  async verifyAllSectionDocumentsLoad() {
    await this.sectionTableLoad();
    const rows = this.page.locator(
      "table.formTable-zebra tbody tr:nth-child(n+3)",
    );
    const count = await rows.count();

    if (count === 0) {
      return;
    }
    for (let i = 0; i < count; i++) {
      const [viewDocumentPage] = await Promise.all([
        this.page.waitForEvent("popup"),
        await rows
          .nth(i)
          .getByRole("link", { name: "View", exact: true })
          .click(),
      ]);
      const url = viewDocumentPage.url();
      if (!url.includes("ViewDocument")) {
        throw new Error(
          `Expected popup URL to include 'ViewDocument', got: ${url}`,
        );
      }
      await viewDocumentPage.close();
    }
  }

  /**
   * Validates the visibility of restricted documents after an upload, based on
   * a list of expected documents and their visibility status.
   * @returns A string describing validation issues if any are found
   */
  async validateRestrictedSectionDocumentUpload(
    section: string,
    user: string,
    documents: DocumentCheck[],
  ) {
    const issues: string[] = [];

    await this.page;
    await this.sectionTableLoad();
    await expect(
      this.page.locator("td.documentInContentsIndex span").first(),
      `Documents table did not load for User: ${user}, Section: ${section}`,
    ).toBeVisible();

    for (const doc of documents) {
      const locator = this.page.locator("td.documentInContentsIndex span", {
        hasText: `${doc.name}`,
      });

      const count = await locator.count();
      const isVisible = count > 0;

      if (doc.shouldBeVisible && !isVisible) {
        issues.push(`Expected ${doc.name} to be visible but it wasn't.`);
      }
      if (!doc.shouldBeVisible && isVisible) {
        issues.push(`Expected ${doc.name} to NOT be visible but it was.`);
      }
    }

    if (issues.length > 0) {
      return `Validation failed for ${user} in Section ${section}:\n - ${issues.join(
        "\n - ",
      )}`;
    }
  }

  /**
   * Validates the presence of an unrestricted document within a specific section.
   */
  async validateUnrestrictedSectionDocument(filename, section) {
    await this.sectionTableLoad();
    await expect(
      this.page.locator("td.documentInContentsIndex span").first(),
      `Documents table did not load for Section: ${section}, filename: ${filename}`,
    ).toBeVisible();

    const locator = this.page.locator("td.documentInContentsIndex span", {
      hasText: `${filename}`,
    });

    const count = await locator.count();
    const isVisible = count > 0;

    if (!isVisible) {
      return `Unable to locate the unrestricted document in Section ${section}`;
    }
  }

  /**
   * Validates the presence of a single restricted document within a specific section.
   */
  async validateSingleRestrictedSectionDocument(filename, section) {
    await this.sectionTableLoad();
    await expect(
      this.page.locator("td.documentInContentsIndex span").first(),
      `Documents table did not load for Section: ${section}, Filename: ${filename}`,
    ).toBeVisible();

    const locator = this.page.locator("td.documentInContentsIndex span", {
      hasText: `${filename}`,
    });

    const count = await locator.count();
    const isVisible = count > 0;

    if (!isVisible) {
      return `Edit: Unable to locate edited filename for restricted document in Section ${section}`;
    }
  }

  /**
   * Clicks the "Upload Document(s)" button to navigate to the document upload page.
   */
  async goToUploadDocuments() {
    const uploadButton = this.page.getByRole("link", {
      name: "Upload Document(s)",
    });
    await uploadButton.click();
  }
}

export default SectionDocumentsPage;
