import { Base } from "../base";
import { DocumentModel } from "../../data/documentModel";
import ViewDocumentPage from "./viewDocument.page";
import { expect } from "../../fixtures";

interface DocumentCheck {
  name: string;
  shouldBeVisible: boolean;
}

class SectionDocumentsPage extends Base {
  readonly viewDocumentPage: ViewDocumentPage;

  constructor(page) {
    super(page);
    this.viewDocumentPage = new ViewDocumentPage(page);
  }

  async verifyDocumentRemoval(user, section) {
    await this.page
      .locator("table.formTable-zebra tbody tr:nth-child(n+2)")
      .first()
      .waitFor({ state: "visible", timeout: 40000 });
    const rows = this.page.locator(
      "table.formTable-zebra tbody tr:nth-child(n+3)"
    );
    const count = await rows.count();
    if (count > 0) {
      return `Document removal failed for ${user} in Section ${section}`;
    }
  }

  async getSectionDocuments(
    sectionId: string,
    sectionName: string
  ): Promise<DocumentModel[]> {
    const documents: DocumentModel[] = [];
    await this.page
      .locator("table.formTable-zebra tbody tr:nth-child(n+2)")
      .first()
      .waitFor({ state: "visible", timeout: 40000 });
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

  async validateRestrictedSectionDocumentUpload(
    section: string,
    user: string,
    documents: DocumentCheck[]
  ) {
    const issues: string[] = [];

    await this.page;

    await expect(
      this.page.locator("td.documentInContentsIndex span").first(),
      `Documents table did not load for User: ${user}, Section: ${section}`
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
        "\n - "
      )}`;
    }
  }

  async validateUnrestrictedSectionDocument(filename, section) {
    await expect(
      this.page.locator("td.documentInContentsIndex span").first(),
      `Documents table did not load for Section: ${section}, filename: ${filename}`
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

  async validateSingleRestrictedSectionDocument(filename, section) {
    await expect(
      this.page.locator("td.documentInContentsIndex span").first(),
      `Documents table did not load for Section: ${section}, Filename: ${filename}`
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

async goToUploadDocumentsFromIndex() {
    const uploadButton = this.page.getByRole("link", { name: "Upload Document(s)" });
    await uploadButton.click();
}
}

export default SectionDocumentsPage;
