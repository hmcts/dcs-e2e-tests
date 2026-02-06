# Page Object Model

A Page Object Model (POM) is a design pattern in test automation that aims to reduce code duplication and improve test maintenance. This document explains the POM implementation in this project.

## Structure

The POM in this project is organized into two main categories: **Pages** and **Components**.

```sh
├── page-objects/
├──── base.ts                # Base class for all page objects
├──── components/            # Reusable components shared across pages
│     ├── caseNavigationBar.ts
│     └── navigationBar.ts
└──── pages/                 # Page-specific objects
      ├── case/
      └── platform/
```

### Base Class (`base.ts`)

All page objects in this project extend the `Base` class (`playwright-e2e/page-objects/base.ts`). This class serves as a foundation for all page objects and provides them with:

-   A Playwright `page` object.
-   Instances of shared components like `NavigationBar` and `CaseNavigationBar`.

```typescript
// playwright-e2e/page-objects/base.ts
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
```

### Components

Components are reusable parts of the UI that can appear on multiple pages. They encapsulate the locators and methods for interacting with a specific piece of the UI. A good example is the `NavigationBar` component (`playwright-e2e/page-objects/components/navigationBar.ts`), which represents the main navigation bar of the application.

```typescript
// playwright-e2e/page-objects/components/navigationBar.ts
class NavigationBar {
  page: Page;
  links: Record<NavLink, Locator>;

  constructor(page: Page) {
    this.page = page;
    this.links = {
      Home: page.getByRole("link", { name: "Home" }),
      // ...
    };
  }

  async navigateTo(link: NavLink) {
    // ...
  }
}
```

### Pages

Pages represent entire pages of the application. They extend the `Base` class and can use the shared components, as well as define their own page-specific locators and methods.

For example, the `HomePage` object (`playwright-e2e/page-objects/pages/platform/home.page.ts`) represents the application's home page.

```typescript
// playwright-e2e/page-objects/pages/platform/home.page.ts
class HomePage extends Base {
  accountMessage: Locator;

  constructor(page) {
    super(page);
    this.accountMessage = page.locator("#content");
  }

  async open() {
    await this.page.goto(config.urls.base);
  }
}
```

## How to use the Page Object Model

By using fixtures, the page objects are instantiated and made available to the tests. This allows you to write clean and readable tests that focus on the test logic rather than on the implementation details of the page structure.

```typescript
// Example test
import { test } from "../fixtures";

test("should navigate to the home page", async ({ homePage }) => {
  await homePage.open();
  // ...
});
```
This structure makes the test framework more robust, maintainable, and easier to use.
