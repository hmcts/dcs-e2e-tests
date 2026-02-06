# Fixtures

[Fixtures](https://playwright.dev/docs/test-fixtures) are a powerful feature of Playwright that allow you to encapsulate setup and teardown steps and provide dependencies to your tests. This project makes extensive use of fixtures to provide page objects, utilities, and configuration to the tests in a clean and reusable way.

## Fixture Structure

To keep the fixtures organized, they are split into multiple files based on their purpose:

-   **`playwright-e2e/utils/utils.fixtures.ts`**: This file defines fixtures for utility classes, such as the `config` object, `cookieUtils`, and `axeUtils` for accessibility testing.

    ```typescript
    // playwright-e2e/utils/utils.fixtures.ts
    export const utilsFixtures = {
      config: async ({}, use) => {
        await use(config);
      },
      cookieUtils: async ({}, use) => {
        await use(new CookieUtils());
      },
      // ...
    };
    ```

-   **`playwright-e2e/page-objects/pages/page.fixtures.ts`**: This file is responsible for creating fixtures for all the page objects. Each fixture provides an instantiated page object to the tests.

    ```typescript
    // playwright-e2e/page-objects/pages/page.fixtures.ts
    export const pageFixtures = {
      homePage: async ({ page }, use) => {
        await use(new HomePage(page));
      },
      caseSearchPage: async ({ page }, use) => {
        await use(new CaseSearchPage(page));
      },
      // ...
    };
    ```

-   **`playwright-e2e/fixtures.ts`**: This is the central file where all the fixtures are merged together. It imports the utility and page fixtures, extends the base Playwright `test` object, and exports a custom `test` object that should be used in all test files.

    ```typescript
    // playwright-e2e/fixtures.ts
    export const test = baseTest.extend<CustomFixtures>({
      ...pageFixtures,
      ...utilsFixtures,

      // Provide currentUser and eligibleUsers to all tests
      currentUser: async ({}, use) => {
        await use(currentUser);
      },
      // ...
    });
    ```

## How to use fixtures

To use the custom fixtures in your tests, you need to import the `test` object from `playwright-e2e/fixtures.ts` instead of from `@playwright/test`.

```typescript
// playwright-e2e/tests/my-test.spec.ts
import { test } from "../fixtures";

test("my test", async ({ homePage, config }) => {
  // homePage and config are now available as arguments
  await homePage.open();
  // ...
});
```

By using this structure, all the page objects and utility classes are available to your tests as type-safe fixtures, which simplifies test writing and maintenance.
