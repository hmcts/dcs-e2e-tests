# DCS E2E Tests

This repository contains the end-to-end (E2E) tests for the Crown Court Digital Case System (DCS), implemented using [Playwright](https://playwright.dev/).

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Configuration](#environment-configuration)
- [Running Tests](#running-tests)
  - [Filtering Tests with Tags](#filtering-tests-with-tags)
  - [Local Test Execution](#local-test-execution)
  - [Running Tests with Docker](#running-tests-with-docker)
- [Test Strategy: Tags and Users](#test-strategy-tags-and-users)
  - [Dynamic Test Generation Pattern](#dynamic-test-generation-pattern)
  - [In-Test User Switching Pattern](#in-test-user-switching-pattern)
  - [How `TEST_TAG` and `TEST_USERS` Work Together](#how-test_tag-and-test_users-work-together)
  - [Execution Scenarios](#execution-scenarios)
- [Development](#development)
  - [Linting](#linting)
  - [Updating Snapshots](#updating-snapshots)
- [Reporting](#reporting)
  - [Allure Reports](#allure-reports)
- [Further Documentation](#further-documentation)
- [Project Structure](#project-structure)
- [Key Concepts](#key-concepts)
  - [Configuration](#configuration)
  - [Fixtures](#fixtures)
  - [Page Object Model (POM)](#page-object-model-pom)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version >=20.11.1)
- [Yarn](https://yarnpkg.com/) (version 4.x)
- [Docker](https://www.docker.com/) (for containerized testing)

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/hmcts/dcs-e2e-tests.git
    cd dcs-e2e-tests
    ```

2.  **Install dependencies:**
    This will install all the required npm packages.
    ```bash
    yarn install
    ```

3.  **Install Playwright browsers:**
    This command installs the browsers needed by Playwright (Chromium, Firefox, WebKit) and their dependencies.
    ```bash
    yarn setup
    ```

### Environment Configuration

Test configurations, including user credentials and environment URLs, are managed through a `.env` file.

1.  **Create a `.env` file:**
    Copy the `.env.example` file to a new file named `.env`:

    ```bash
    cp .env.example .env
    ```

2.  **Populate the `.env` file:**
    This command fetches secrets for the specified environment from the Azure Key Vault and populates your `.env` file.
    ```bash
    yarn load-secrets
    ```
    _Note: You must have the necessary access permissions to the vault._

## Running Tests

### Filtering Tests with Tags

You can run specific subsets of tests by using tags. Tags are defined at the top of test files (e.g., `@nightly`, `@regression`, `@smoke`).

By default, running `yarn test:chrome`, `yarn test:firefox`, etc., will execute tests tagged with `@nightly`.

To run a different set of tests, you can override the default by setting the `TEST_TAG` environment variable. For example, to run the regression suite:

```bash
TEST_TAG=regression yarn test:chrome
```

### Local Test Execution

The following scripts are available to run tests on your local machine. They will run the `@nightly` suite by default. See the "Test Strategy" section for details on running against multiple users.

- **Run in Chrome:**
  ```bash
  yarn test:chrome
  ```
- **Run in Firefox:**
  ```bash
  yarn test:firefox
  ```
- **Run in WebKit (Safari):**
  ```bash
  yarn test:webkit
  ```
- **Run in Microsoft Edge:**
  ```bash
  yarn test:edge
  ```

### Running Tests with Docker

You can also run the tests in a containerized environment using Docker. This ensures a consistent testing environment.

1.  **Build the Docker image:**
    ```bash
    yarn build-docker
    ```
2.  **Run tests in the container:**
    This command starts a container and runs the visual regression test suite.
    ```bash
    yarn start-visual-container
    ```

## Test Strategy: Tags and Users

A crucial aspect of this test suite is its ability to validate functionality for different user roles. 

### Dynamic Test Generation Pattern

This pattern is used by suites like `reviewEvidence.spec.ts`. These suites leverage the `TEST_USERS` environment variable to dynamically generate tests for different users.

1.  **Ignoring Global Login:** These suites explicitly ignore any globally configured user session (like `trainer01` from `playwright.config.ts`) and start each test in a logged-out state.
2.  **Reading `TEST_USERS`:** The test file reads the `process.env.TEST_USERS` environment variable. If not set, it defaults to `nightly`.
3.  **Building a User List:** Based on the `TEST_USERS` variable, the test creates a list of users to run against:
    -   If `TEST_USERS` is `nightly`, the list contains a single `currentUser` (from fixtures).
    -   If `TEST_USERS` is `regression`, the list contains all `eligibleUsers` (from fixtures).
4.  **Generating Tests:** The test suite then uses a `for` loop to dynamically generate a separate, isolated Playwright `test` for each user in the list, performing a fresh login for that user at the beginning of each generated test.

### How `TEST_TAG` and `TEST_USERS` Work Together

-   **`TEST_TAG`** (`nightly`, `regression`): This variable, used by Playwright's `--grep` flag, determines **which test suites to run**.
-   **`TEST_USERS`** (`nightly`, `regression`): This variable is read primarily by test suites employing the **Dynamic Test Generation Pattern** to determine **how many users to loop through and generate tests for**. 

### Execution Scenarios

-   **CI Nightly Run:** Jenkins sets `TEST_TAG=nightly` and `TEST_USERS=nightly`. Playwright selects tests tagged with `@nightly`.
    -   `Dynamic Test Generation` suites (e.g., `reviewEvidence.spec.ts`) read `TEST_USERS=nightly` and generate tests for only the single `currentUser`.

-   **CI Regression Run:** Jenkins sets `TEST_TAG=regression` and `TEST_USERS=regression`. Playwright selects tests tagged with `@regression`.
    -   `Dynamic Test Generation` suites read `TEST_USERS=regression` and generate separate tests for **every** user in the `eligibleUsers` list.

-   **Local Regression Run (All Users for Dynamic Tests):** To fully replicate the CI regression behavior for tests using the Dynamic Test Generation pattern on your local machine, you must set **both** environment variables:
    ```bash
    TEST_TAG=regression TEST_USERS=regression yarn test:chrome
    ```
    If you only set `TEST_TAG=@regression` (and `TEST_USERS` is unset), then Dynamic Test Generation pattern suites will default to running only for the single `currentUser`.

-   **Running a Specific File (e.g., `yarn playwright test tests/my-specific.spec.ts --project=chrome`):**
    -   `TEST_TAG` is irrelevant for filtering, as you've specified the file directly.
    -   If `my-specific.spec.ts` uses the `Dynamic Test Generation Pattern`, it will default to `TEST_USERS=nightly` (single user) unless `TEST_USERS` is explicitly set in your command.

## Development

### Linting

To check the code for linting errors and ensure it meets style guidelines, run:

```bash
yarn lint
```

### Updating Snapshots

This project uses snapshot tests for visual regression testing. Baseline snapshots are stored in the repository.

If intentional visual changes are made in the UI, you will need to update the snapshots. The CI pipeline is the source of truth for snapshots, as inconsistencies do occur between snapshots generated locally (even in a docker container) and in the CI environment.

To update snapshots for a pull request, it is recommended to run a build in Jenkins with the following temporary modifications to `Jenkinsfile_nightly`, then download the updated snapshots and commit them to your branch.

Jenkinsfile_nightly updates:

Comment out:
yarnBuilder.yarn(buildPlaywrightCommand(TAGS_TO_RUN, params.BROWSER_TO_RUN))

Uncomment out:
// yarnBuilder.yarn(buildPlaywrightCommand(TAGS_TO_RUN, params.BROWSER_TO_RUN)+ " --update-snapshots")

Uncomment out:
// archiveArtifacts artifacts: 'playwright-e2e/tests/**/\*-snapshots/**/\*.png',
// allowEmptyArchive: true

Uncomment out:
// stage('Archive PTPH Snapshots') {
// archiveArtifacts artifacts: 'playwright-e2e/tests/**/\*-snapshots/**/\*.png', allowEmptyArchive: true
// }

## Reporting

### Allure Reports

This project uses [Allure](https://allurereport.org/) for detailed test reporting.

- **To run tests and generate a report:**
  ```bash
  yarn test:allure
  ```
- **To open the latest report:**
  The report will be generated in the `allure-report` directory. To open it, run:
  ```bash
  yarn allure:open
  ```
  Allure reports are also generated and archived as part of every CI build.

## Further Documentation

This `README.md` provides a general overview. For more detailed information on specific topics, please refer to the documents in the `docs/` directory:

- `docs/BEST_PRACTICE.md`: Best practices for writing tests.
- `docs/CI.md`: Detailed information about the CI/CD setup.
- `docs/CONFIGURATION.md`: Explanation of the configuration files.
- `docs/FIXTURES.md`: Documentation for custom Playwright fixtures.
- `docs/PAGE_OBECT_MODEL.md`: Deep dive into the Page Object Model implementation.
- `docs/VISUAL_TESTING.md`: Information on visual regression testing and snapshots.

## Project Structure

```
dcs-e2e-tests/
├── docs/
│   ├── ACCESSIBILITY.md
│   └── ...
├── playwright-e2e/
│   ├── data/
│   ├── helpers/
│   ├── page-objects/
│   │   ├── components/
│   │   └── pages/
│   ├── tests/
│   │   ├── my-test.spec.ts
│   │   └── my-test.spec.ts-snapshots/
│   │       └── snapshot-name-chrome.png
│   ├── utils/
│   ├── fixtures.ts
│   ├── global.setup.ts
│   └── global.teardown.ts
├── playwright.config.ts
├── package.json
└── README.md
```

- `docs/`: Contains detailed documentation on various aspects of the project.
- `playwright-e2e/`: Contains all the Playwright test-related files.
  - `data/`: Stores test data, including data models and static files (e.g., PDFs, DOCX).
  - `helpers/`: Provides helper functions for complex, multi-step actions (e.g., creating a case).
  - `page-objects/`: Contains the Page Object Model (POM) files, separated into `components` and `pages`.
  - `tests/`: Contains the actual test files (`.spec.ts`). Snapshot directories for visual regression testing are co-located with their corresponding test files.
  - `utils/`: Contains generic, low-level utility functions.
  - `fixtures.ts`: Defines global fixtures for tests.
  - `global.setup.ts`: A script that runs once before all tests to set up user sessions. It checks for existing valid session files and, if one is not found, logs in as the necessary users (e.g., `HMCTS Admin`, `Admin`) and saves their authentication states (cookies, local storage) to a file. This allows tests to bypass the UI login process, speeding up test execution significantly.
  - `global.teardown.ts`: A script that runs once after all tests for cleanup.
- `playwright.config.ts`: The main Playwright configuration file.
- `package.json`: Lists project dependencies and scripts.
- `README.md`: This file.

## Key Concepts

### Configuration

The main Playwright configuration is in `playwright.config.ts`. This file defines settings such as:

- Browser configurations (e.g., viewport size, headless mode).
- Test reporters (e.g., HTML, Allure).
- Global timeout settings.
- The base configuration is extended from `@hmcts/playwright-common`.

### Fixtures

This project extends Playwright's built-in `test` object with custom fixtures defined in `playwright-e2e/fixtures.ts`. This custom `test` object is then used in all tests.

### Page Object Model (POM)

The project follows the Page Object Model design pattern. POMs encapsulate the logic for interacting with a page and its elements, making tests cleaner and more maintainable. Page objects are located in `playwright-e2e/page-objects/` directory.

## CI/CD

This project uses Jenkins for Continuous Integration.

- **`Jenkinsfile_CNP`**: Runs on pull requests to perform checks like linting and formatting.
- **`Jenkinsfile_nightly`**: Runs scheduled nightly tests against the pre-production environment. This pipeline runs a selection of critical functionality tests and deterministically rotates through different user roles each night to ensure broad test coverage. The full regression suite, tagged with `@regression`, is typically run pre-release against all users.

The nightly build is scheduled for 5 PM on weekdays. Detailed test reports (Playwright HTML and Allure) are archived and available in Jenkins. For more details, see the [CI/CD documentation](docs/CI.md).

## Contributing

Please refer to the `CODEOWNERS` file for information on who to contact for reviews. When creating a pull request, please provide a clear description of the changes.

**Note on Pre-commit Hooks:** This project uses pre-commit hooks (configured in `.pre-commit-config.yaml`) to automatically lint and format code before committing. It is recommended to install and use them to ensure code quality.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
