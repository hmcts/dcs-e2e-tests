# DCS E2E Tests

This repository contains the end-to-end tests for the DCS (Digital Case System) using Playwright.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running Tests](#running-tests)
  - [Updating Snapshots](#updating-snapshots)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Fixtures](#fixtures)
- [Page Object Model](#page-object-model)
- [Visual Testing](#visual-testing)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version >=20.11.1)
- [Yarn](https://yarnpkg.com/) (version 4.x)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/hmcts/dcs-e2e-tests.git
    cd dcs-e2e-tests
    ```

2.  **Install dependencies:**

    ```bash
    yarn install
    ```

3.  **Install Playwright browsers:**

    ```bash
    yarn setup
    ```

## Usage

### Running Tests

The following scripts are available to run the tests:

-   **Run all tests (except a11y, performance, and visual) in Chrome:**
    ```bash
    yarn test:chrome
    ```
-   **Run all tests (except a11y, performance, and visual) in Firefox:**
    ```bash
    yarn test:firefox
    ```
-   **Run all tests (except a11y, performance, and visual) in WebKit:**
    ```bash
    yarn test:webkit
    ```
-   **Run all tests (except a11y, performance, and visual) in Edge:**
    ```bash
    yarn test:edge
    ```
-   **Run all tests (except a11y, performance, and visual) in Tablet Chrome:**
    ```bash
    yarn test:tabletchrome
    ```
-   **Run all tests (except a11y, performance, and visual) in Tablet WebKit:**
    ```bash
    yarn test:tabletwebkit
    ```
-   **Run accessibility tests:**
    ```bash
    yarn test:a11y
    ```
-   **Run visual tests:**
    ```bash
    yarn test:visual
    ```

### Updating Snapshots

To update the visual snapshots, run:

```bash
yarn test:update-snapshots
```

## Project Structure

```
dcs-e2e-tests/
├── playwright-e2e/
│   ├── fixtures.ts
│   ├── global.setup.ts
│   ├── global.teardown.ts
│   ├── page-objects/
│   ├── snapshots/
│   ├── tests/
│   └── utils/
├── playwright.config.ts
├── package.json
└── README.md
```

-   `playwright-e2e/`: Contains all the Playwright test-related files.
    -   `fixtures.ts`: Global fixtures for the tests.
    -   `global.setup.ts`: Global setup for the tests.
    -   `global.teardown.ts`: Global teardown for the tests.
    -   `page-objects/`: Contains the Page Object Model files.
    -   `snapshots/`: Stores the visual regression snapshots.
    -   `tests/`: Contains the test files.
    -   `utils/`: Contains utility functions.
-   `playwright.config.ts`: Playwright configuration file.
-   `package.json`: Project dependencies and scripts.
-   `README.md`: This file.

## Configuration

The main configuration for Playwright is in `playwright.config.ts`. This file extends the common configuration from `@hmcts/playwright-common`.

Environment-specific variables are managed through `.env` files. An example can be found in `.env.example`.

## Fixtures

This project uses Playwright fixtures to set up and tear down the test environment. The global fixtures are defined in `playwright-e2e/fixtures.ts`.

## Page Object Model

The project follows the Page Object Model (POM) design pattern. The page objects are located in the `playwright-e2e/page-objects/` directory.

## Visual Testing

Visual regression testing is set up to catch unintended UI changes. The tests are tagged with `@visual` and can be run with `yarn test:visual`.

Snapshots are stored in the `playwright-e2e/snapshots/` directory.

## CI/CD

The project uses Jenkins for Continuous Integration and Continuous Delivery. The Jenkinsfiles (`Jenkinsfile_CNP`, `Jenkinsfile_nightly`, `Jenkinsfile_nightly_parallel`) are located in the root of the repository.

## Contributing

Please refer to the `CODEOWNERS` file for information on who to contact for reviews.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
