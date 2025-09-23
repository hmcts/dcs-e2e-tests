// A base page inherited by pages & components
// can contain any additional config needed + instantiated page object

import { Page } from "@playwright/test";
import NavigationBar from "./components/navigationBar";

export abstract class Base {
  public readonly page: Page;
  navigation: NavigationBar;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationBar(page);
  }
}
