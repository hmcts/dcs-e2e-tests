# Configuration

This project's configuration is split between two main files: `playwright.config.ts` for the Playwright-specific setup, and `playwright-e2e/utils/config.utils.ts` for project-specific settings like users and URLs.

## Playwright Config (`playwright.config.ts`)

The `playwright.config.ts` file in the root of the repository contains all the Playwright-specific configuration. Key aspects of this configuration include:

- **Base Configuration**: It extends a common configuration from `@hmcts/playwright-common`, which provides a shared base for HMCTS projects.
- **Timeout**: The global timeout for tests is set to 8 minutes (`480_000` ms).
- **Reporting**: It uses the built-in HTML reporter for local runs and adds the Allure reporter for CI builds.
- **Projects**: It defines projects for different browsers, with `chrome` and `firefox` being the primary ones.
- **Authentication**: The project uses a global setup (`global.setup.ts`) and stored session files (`.sessions/*.json`) to handle authentication. This means that tests can start already logged in, which saves time and isolates test logic from the login process.

For more details on the available Playwright configuration options, see the [official Playwright documentation](https://playwright.dev/docs/test-configuration).

## Project-Specific Config (`playwright-e2e/utils/config.utils.ts`)

This file contains configuration specific to this application and its test environments.

- **Environments**: The configuration supports multiple environments (`preprod` and `uat`), with `preprod` as the default. The environment can be changed by setting the `TEST_ENV` environment variable.
- **Environment Variables**: The project uses the `dotenv` package to load environment variables from a `.env` file. An example `.env.example` file is provided in the root of the repository.
- **Users**: It defines a comprehensive list of test users with their roles, credentials, and paths to their session files. This allows tests to easily run as different user personas.
- **URLs**: It manages the base URLs and other endpoints for the different environments.

The exported `config` object from this file is used throughout the test framework to access user credentials, URLs, and other configuration values. This provides a single source of truth for all project-specific settings.
