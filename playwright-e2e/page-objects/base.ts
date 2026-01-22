/**
 * Base Page Object
 * ----------------
 * This abstract class serves as the foundation for all other Page Objects
 * (pages and components) within the Playwright E2E test suite.
 *
 * It centralizes common configurations and instantiated Page Object components,
 * such as navigation bars, ensuring consistency and reusability across tests.
 * All specific page and component Page Objects should extend this `Base` class.
 */
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
