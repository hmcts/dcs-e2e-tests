import { Locator } from "@playwright/test";
import { Base } from "../base";

class PTPHPage extends Base {
  ptphForm: Locator;

  constructor(page) {
    super(page);
    this.ptphForm = page.locator("#reviewform");
  }
}

export default PTPHPage;
