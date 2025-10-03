import { Locator } from "@playwright/test";
import { Base } from "../base";

class ReviewEvidencePage extends Base {
  sectionIndex: Locator;
  caseNameHeading: Locator;

  constructor(page) {
    super(page);
    this.sectionIndex = page.locator("#bundleIndexTd");
    this.caseNameHeading = page.locator(".caseName");
  }
}

export default ReviewEvidencePage;
