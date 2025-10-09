import { Locator } from "@playwright/test";
import { Base } from "../base";

class IngestFilePage extends Base {
  ingestLink: Locator;
  ingestHeading: Locator;

  constructor(page) {
    super(page);
    this.ingestLink = page.getByRole("link", { name: "Ingest" });
    this.ingestHeading = page.locator("xpath= //form[@id='form0']//legend[1]");
  }
}

export default IngestFilePage;