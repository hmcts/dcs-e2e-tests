// A base page inherited by pages & components
// can contain any additional config needed + instantiated page object

import { Page } from "@playwright/test";
import NavigationBar from "./components/navigationBar";
import CaseNavigationBar from "./components/caseNavigationBar";

export abstract class Base {
  public readonly page: Page;
  navigation: NavigationBar;
  caseNavigation: CaseNavigationBar;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationBar(page);
    this.caseNavigation = new CaseNavigationBar(page);
  }
}
