import { Base } from "../base";
import { config } from "../../utils";
import { Locator } from "playwright-core";

class HomePage extends Base {
    accountMessage: Locator;
  
  constructor(page) {
    super(page);
    this.accountMessage =page.locator('#content')

  }

  async open() {
    await this.page.goto(config.urls.base); 
  }

}



export default HomePage;
