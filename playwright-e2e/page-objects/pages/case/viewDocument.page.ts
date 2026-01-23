import { Base } from "../../base";

/**
 * Represents a page that displays a document, typically opened as a popup or new tab.
 * This Page Object provides basic functionality to close the document view.
 */
class ViewDocumentPage extends Base {
  constructor(page) {
    super(page);
  }

  /**
   * Closes the currently active document viewing page.
   */
  async close() {
    await this.page.close();
  }
}

export default ViewDocumentPage;
