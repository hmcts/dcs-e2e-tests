import { Base } from "../base";
import { config } from "../../utils";

class HomePage extends Base {
  
  constructor(page) {
    super(page);

  }

  async open() {
    await this.page.goto(config.urls.base); 
  }
}

export default HomePage;
