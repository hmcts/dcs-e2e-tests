import { Base } from "../base";
import { config } from "../../utils";

class HomePage extends Base {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.page.goto(config.urls.preProdBaseUrl); //Aim to update this to be more interchangeable based on environment
  }
}

export default HomePage;
