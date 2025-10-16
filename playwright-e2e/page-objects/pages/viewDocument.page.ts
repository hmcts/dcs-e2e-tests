import { Base } from "../base";

class ViewDocumentPage extends Base {
  constructor(page) {
    super(page);
  }

  async close() {
    await this.page.close();
  }
}

export default ViewDocumentPage;
