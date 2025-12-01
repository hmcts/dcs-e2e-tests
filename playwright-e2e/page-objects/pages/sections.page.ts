import SectionDocumentsPage from "./sectionDocuments.page";
import { Page } from "@playwright/test";
import { Base } from "../base";
import { Locator } from "@playwright/test";
import { DocumentModel, documents } from "../../data/documentModel";
import UploadDocumentPage from "./uploadDocument.page";
import { expect } from "@playwright/test";

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

  async rowCount(): Promise<number> {
    const sectionRows = this.page.locator(
      "table.formTable-zebra tbody > tr:not(:first-child)"
    );
    return await sectionRows.count();
  }

  async getSectionTitle(rowIndex: number): Promise<string> {
    const row = this.page
      .locator("table.formTable-zebra tbody > tr:not(:first-child)")
      .nth(rowIndex - 1);
    await row.waitFor({ state: "visible", timeout: 10000 });
    const title = await row.locator("td:nth-child(3)").innerText();
    return title.trim();
  }

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

  async goToViewDocuments(rowIndex: number) {
    const row = this.page
      .locator("table.formTable-zebra tbody tr:not(:first-child)")
      .nth(rowIndex - 1);

    const viewDocsButton = row.locator(
      'a.button-level-two[title*="view the list of documents"]'
    );
    await viewDocsButton.click();
  }

  async goToViewDocumentsByKey(sectionKey: string) {
    const row = this.page.locator(`tr:has(a[href*="${sectionKey}"])`);
    const viewDocsButton = row.locator(
      'a.button-level-two[title*="view the list of documents"]'
    );
    await viewDocsButton.click();
  }

  async goToViewDocumentsBySectionLetter(sectionLetter: string) {
    const row = this.page.locator(
      `tr:has(td:nth-child(2):text-is("${sectionLetter}"))`
    );
    const viewDocsButton = row.locator(
      'a.button-level-two[title*="view the list of documents"]'
    );
    await viewDocsButton.click();
  }

  async goToUploadDocuments(sectionKey: string) {
    const row = this.page.locator(`tr:has(a[href*="${sectionKey}"])`);
    const uploadButton = row.getByRole("link", { name: "Upload Document(s)" });
    await uploadButton.click();
  }

  async goToUpdateDocuments(sectionKey: string) {
    const row = this.page.locator(`tr:has(a[href*="${sectionKey}"])`);
    const updateButton = row.getByRole("link", {
      name: "Update All Documents",
    });
    await updateButton.click();
  }

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

  async uploadUnrestrictedSectionDocument(
    key: string,
    filename: string,
    section: string
  ) {
    await this.goToUploadDocuments(key);
    await this.uploadDocumentPage.uploadUnrestrictedDocument(filename);
  }


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

  async gotoCreateNewSection(){
    await this.createSectionLink.click({timeout:15000});
  }

}
export default SectionsPage;
