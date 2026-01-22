import SectionDocumentsPage from "./sectionDocuments.page";
import { Page } from "@playwright/test";
import { Base } from "../base";
import { Locator } from "@playwright/test";
import { DocumentModel, documents } from "../../data/documentModel";
import UploadDocumentPage from "./uploadDocument.page";
import { expect } from "@playwright/test";

/**
 * Represents the "Sections" page within a case, which lists all case sections.
 * This Page Object provides functionalities to manage and interact with case sections,
 * including viewing documents, uploading new documents, and navigating to section-specific actions.
 */
class SectionsPage extends Base {
  readonly page: Page;
  readonly sectionDocumentsPage: SectionDocumentsPage;
  uploadDocumentPage: UploadDocumentPage;
  viewDocumentsLink: Locator;
  createSectionLink : Locator;

  constructor(page) {
    super(page);
    this.page = page;
    this.sectionDocumentsPage = new SectionDocumentsPage(page);
    this.uploadDocumentPage = new UploadDocumentPage(page);
    this.viewDocumentsLink = page.getByRole("link", { name: "View Documents" });
    this.createSectionLink = page.getByRole("link", { name: "Create New Section" }).first();
  }

  /**
   * Returns the total number of section rows displayed in the sections table.
   */
  async rowCount(): Promise<number> {
    const sectionRows = this.page.locator(
      "table.formTable-zebra tbody > tr:not(:first-child)"
    );
    return await sectionRows.count();
  }

  /**
   * Retrieves the title of a section given its row index in the table.
   */
  async getSectionTitle(rowIndex: number): Promise<string> {
    const row = this.page
      .locator("table.formTable-zebra tbody > tr:not(:first-child)")
      .nth(rowIndex - 1);
    await row.waitFor({ state: "visible", timeout: 10000 });
    const title = await row.locator("td:nth-child(3)").innerText();
    return title.trim();
  }

  /**
   * Retrieves the unique ID (key) of a section given its row index.
   * Extracts the key from the "View Documents" link's href attribute.
   */
  async getSectionId(rowIndex: number): Promise<string> {
    const row = this.page
      .locator("table.formTable-zebra tbody > tr:not(:first-child)")
      .nth(rowIndex - 1);
    const href = await row
      .locator('a.button-level-two[title*="view the list of documents"]')
      .getAttribute("href");

    const match = href?.match(/sectionRowKey=([^&]+)/);
    return match ? match[1] : "";
  }

  /**
   * Navigates to the documents page for a specific section using its row index.
   */
  async goToViewDocuments(rowIndex: number) {
    const row = this.page
      .locator("table.formTable-zebra tbody tr:not(:first-child)")
      .nth(rowIndex - 1);

    const viewDocsButton = row.locator(
      'a.button-level-two[title*="view the list of documents"]'
    );
    await viewDocsButton.click();
  }

  /**
   * Navigates to the documents page for a specific section using its unique section key.
   */
  async goToViewDocumentsByKey(sectionKey: string) {
    const row = this.page.locator(`tr:has(a[href*="${sectionKey}"])`);
    const viewDocsButton = row.locator(
      'a.button-level-two[title*="view the list of documents"]'
    );
    await viewDocsButton.click();
  }

  /**
   * Navigates to the documents page for a specific section using its letter designation.
   * @param sectionLetter - The letter designation of the section (e.g., "A", "B").
   */
  async goToViewDocumentsBySectionLetter(sectionLetter: string) {
    const row = this.page.locator(
      `tr:has(td:nth-child(2):text-is("${sectionLetter}"))`
    );
    const viewDocsButton = row.locator(
      'a.button-level-two[title*="view the list of documents"]'
    );
    await viewDocsButton.click();
  }

  /**
   * Navigates to the document upload page for a specific section using the section key.
   */
  async goToUploadDocuments(sectionKey: string) {
    const row = this.page.locator(`tr:has(a[href*="${sectionKey}"])`);
    const uploadButton = row.getByRole("link", { name: "Upload Document(s)" });
    await uploadButton.click();
  }

  /**
   * Navigates to the "Update All Documents" page for a specific section using the section key.
   */
  async goToUpdateDocuments(sectionKey: string) {
    const row = this.page.locator(`tr:has(a[href*="${sectionKey}"])`);
    const updateButton = row.getByRole("link", {
      name: "Update All Documents",
    });
    await updateButton.click();
  }

  /**
   * Retrieves all section and document details by iterating through all sections
   * and then fetching their respective documents.
   * @returns An array of `DocumentModel` objects for all documents across all sections.
   */
  async getSectionAndDocumentDetails(): Promise<DocumentModel[]> {
    const sectionCount = await this.rowCount();
    const sectionDocuments: DocumentModel[] = [];

    for (let rowIndex = 1; rowIndex <= sectionCount; rowIndex++) {
      const sectionTitle = await this.getSectionTitle(rowIndex);
      const sectionKey = await this.getSectionId(rowIndex);
      await this.goToViewDocuments(rowIndex);

      const documents = await this.sectionDocumentsPage.getSectionDocuments(
        sectionKey,
        sectionTitle
      );
      sectionDocuments.push(...documents);
      await this.sectionDocumentsPage.verifyAllSectionDocumentsLoad();
      await this.caseNavigation.navigateTo("Sections");
    }
    return sectionDocuments;
  }

  /**
   * Retrieves a sample of section and document details from a random selection of sections.
   * @param [sampleSize=6] - The number of random sections to sample.
   * @returns An array of `DocumentModel` objects for documents from the sampled sections.
   */
  async getSectionsAndDocumentsSample(
    sampleSize = 6
  ): Promise<DocumentModel[]> {
    const sectionCount = await this.rowCount();
    const sectionDocuments: DocumentModel[] = [];

    const indexes = new Set<number>();
    while (indexes.size < Math.min(sampleSize, sectionCount)) {
      const randomIndex = Math.floor(Math.random() * sectionCount) + 1;
      indexes.add(randomIndex);
    }
    const randomRows = Array.from(indexes);
    console.log("RANDOMROWS", randomRows);

    for (const rowIndex of randomRows) {
      const sectionTitle = await this.getSectionTitle(rowIndex);
      const sectionKey = await this.getSectionId(rowIndex);
      await this.goToViewDocuments(rowIndex);

      const documents = await this.sectionDocumentsPage.getSectionDocuments(
        sectionKey,
        sectionTitle
      );
      sectionDocuments.push(...documents);
      await this.sectionDocumentsPage.verifyAllSectionDocumentsLoad();
      await this.caseNavigation.navigateTo("Sections");
    }
    return sectionDocuments;
  }

  /**
   * Filters the global list of documents (`../../data/documentModel.ts`)
   * to find those accessible by a specific user role.
   * @returns An array of `DocumentModel` objects accessible by the specified user.
   */
  filterDocumentsByUser(user: string) {
    const filteredDocuments = documents.filter((document) =>
      document.roles?.includes(user)
    );
    return filteredDocuments;
  }

  /**
   * Compares a user's expected sections and documents access against those actually found in the UI.
   * Identifies and reports any missing expected documents or unexpected extra documents.
   * @param userExpectedDocuments - Documents expected to be visible for the user.
   * @param userAvailableDocuments - Documents actually found for the user.
   * @returns An object containing arrays of descriptions for missing and unexpected documents.
   */
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
          `Section Title: ${expectedDocument.sectionTitle}, Document Name: ${expectedDocument.documentName} - is missing`
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
          `Section Title: ${availableDocument.sectionTitle}, Document Name: ${availableDocument.documentName} - is unexpectedly showing`
        );
      }
    }
    return { missingDocuments, unexpectedDocuments };
  }

  /**
   * Compares a user's expected sections and documents against a sample of those
   * actually found in the UI, focusing on unexpected documents.
   * @param userExpectedDocuments - Documents expected to be visible for the user.
   * @param userAvailableDocuments - Documents actually found for the user (sample).
   * @returns An array of strings describing any unexpected documents found.
   */
  async compareExpectedVsAvailableSectionsAndDocumentsSample(
    userExpectedDocuments: DocumentModel[],
    userAvailableDocuments: DocumentModel[]
  ) {
    const unexpectedDocuments: string[] = [];

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
          `Section Title: ${availableDocument.sectionTitle}, Document Name: ${availableDocument.documentName} - is unexpectedly showing`
        );
      }
    }
    return unexpectedDocuments;
  }

  /**
   * Retrieves the unique keys for a list of specified sections.
   * @returns An object mapping section names to their keys.
   */
  async getSectionKeys(sections: string[]) {
    const sectionKeys: Record<string, string> = {};
    await expect(async () => {
      const count = await this.rowCount();
      expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 20_000 });
    for (const section of sections) {
      const cell = this.page
        .getByRole("cell", { name: `${section}`, exact: true })
        .first();
      const indexLink = cell.locator('a.fieldAuditTrail[href*="Index"]');
      await expect(
        indexLink,
        `No href available for section: ${section}`
      ).toHaveAttribute("href");
      const href = (await indexLink.getAttribute("href"))!;

      // extract the section key from the href
      // href example: 'javascript:viewAuditTrail('Section', 'a8db8c2e...', 'bc1b906e...', 'Index')'
      const parts = href.split("'");
      const key = parts[5];
      sectionKeys[section] = key;
    }
    return sectionKeys;
  }

  /**
   * Uploads an unrestricted document to a specified section and validates its visibility.
   */
  async uploadAndValidateUnrestrictedSectionDocument(
    key: string,
    filename: string,
    section: string
  ) {
    await this.goToUploadDocuments(key);
    await this.uploadDocumentPage.uploadUnrestrictedDocument(filename);

    const unrestrictedDocument = this.sectionDocumentsPage.page.locator(
      "td.documentInContentsIndex span",
      {
        hasText: `${filename}`,
      }
    );
    try {
      await unrestrictedDocument.waitFor({ state: "visible", timeout: 10000 });
    } catch (error) {
      return `Unrestricted document upload not found: ${filename} in Section: ${section}. Error: ${error}`;
    }
  }

  /**
   * Uploads an unrestricted document to a specified section without validation.
   */
  async uploadUnrestrictedSectionDocument(
    key: string,
    filename: string
  ) {
    await this.goToUploadDocuments(key);
    await this.uploadDocumentPage.uploadUnrestrictedDocument(filename);
  }

  /**
   * Uploads a restricted document to a specified section, associating it with a defendant.
   */
  async uploadRestrictedSectionDocument(
    key: string,
    filename: string,
    defendant: string
  ) {
    await this.goToUploadDocuments(key);
    await this.uploadDocumentPage.uploadRestrictedSectionDocument(
      defendant,
      filename
    );
  }

  /**
   * Clicks the "Create New Section" link to navigate to the section creation page.
   */
  async gotoCreateNewSection(){
    await this.createSectionLink.click({timeout:15000});
  }

}
export default SectionsPage;
