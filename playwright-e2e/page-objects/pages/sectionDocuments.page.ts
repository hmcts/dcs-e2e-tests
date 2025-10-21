import { Base } from "../base";
import { DocumentModel } from "../../data/documentModel";
import ViewDocumentPage from "./viewDocument.page";

class SectionDocumentsPage extends Base {
  readonly viewDocumentPage: ViewDocumentPage;

  constructor(page) {
    super(page);
    this.viewDocumentPage = new ViewDocumentPage(page);
  }

  async getSectionDocuments(
    sectionId: string,
    sectionName: string
  ): Promise<DocumentModel[]> {
    const documents: DocumentModel[] = [];
    await this.page
      .locator("table.formTable-zebra tbody tr:nth-child(n+2)")
      .first()
      .waitFor({ state: "visible", timeout: 20000 });
    const rows = this.page.locator(
      "table.formTable-zebra tbody tr:nth-child(n+3)"
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

  async verifyAllSectionDocumentsLoad() {
    const rows = this.page.locator(
      "table.formTable-zebra tbody tr:nth-child(n+3)"
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
          `Expected popup URL to include 'ViewDocument', got: ${url}`
        );
      }
      await viewDocumentPage.close();
    }
  }
}
export default SectionDocumentsPage;
