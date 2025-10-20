import SectionDocumentsPage from "./sectionDocuments.page";
import { Page } from "@playwright/test";
import { Base } from "../base";
import { Locator } from "@playwright/test";
import { DocumentModel, documents } from "../../data/documentModel";

class SectionsPage extends Base {
  readonly page: Page;
  readonly sectionDocumentsPage: SectionDocumentsPage;
  viewDocumentsLink: Locator;

  constructor(page) {
    super(page);
    this.page = page;
    this.sectionDocumentsPage = new SectionDocumentsPage(page);
    this.viewDocumentsLink = page.getByRole("link", { name: "View Documents" });
  }

  async rowCount(): Promise<number> {
    const sectionRows = this.page.locator(
      "table.formTable-zebra tbody > tr:not(:first-child)"
    );
    return sectionRows.count();
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
}

export default SectionsPage;
