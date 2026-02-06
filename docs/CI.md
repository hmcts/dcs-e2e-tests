# CI/CD - Jenkins

This project uses Jenkins for Continuous Integration. There are two main Jenkinsfiles in the root of the repository: `Jenkinsfile_CNP` and `Jenkinsfile_nightly`.

-   **`Jenkinsfile_CNP`**: Runs on pull requests to perform checks like linting and formatting.
-   **`Jenkinsfile_nightly`**: Runs the main scheduled E2E tests, such as the `@nightly` and `@regression` suites.

## Nightly Schedule

The main test suite is scheduled to run at 5 PM on weekdays (Monday to Friday). This is defined by the following cron expression in the `Jenkinsfile_nightly`:

```groovy
properties([
  pipelineTriggers([cron('H 17 * * 1-5')]),
  ...
])
```

## Build Parameters

The `Jenkinsfile_nightly` is parameterized to allow for flexible test execution. The most important parameters are:

-   `BASE_URL`: The environment to test against.
-   `FUNCTIONAL_TESTS_WORKERS`: The number of parallel workers to use. Defaults to `4`.
-   `TAGS_TO_RUN`: Allows for manually triggering a specific suite of tests. Its primary use is to run the full regression suite by setting it to `@regression`. If left empty, the `@nightly` suite runs by default.
-   `BROWSER_TO_RUN`: The browser to execute the tests on.

## CI Test Strategy

The `Jenkinsfile_nightly` contains the core logic that determines the scope of a test run. It sets two crucial environment variables, `TEST_TAG` and `TEST_USERS`, based on the `TAGS_TO_RUN` build parameter.

```groovy
def isFullRegressionRun = TAGS_TO_RUN?.trim() == '@regression'

env.TEST_USERS = isFullRegressionRun ? 'regression' : 'nightly'
  
if (env.TEST_USERS == 'regression') {
  env.TEST_TAG = '@regression'
} else {
  env.TEST_TAG = '@nightly'
}
```

-   **`TEST_TAG`**: This variable is passed to the `yarn test:*` scripts and is used by Playwright's `--grep` flag to select **which test suites to run** (e.g., tests tagged with `@nightly` or `@regression`).
-   **`TEST_USERS`**: This variable determines the **user execution strategy** and is read by test suites that use the "Dynamic Test Generation" pattern (see `README.md` for a full explanation).

### Nightly User Rotation

When a standard nightly build runs (i.e., `TEST_USERS` is `nightly`), a stateless, deterministic user rotation mechanism is activated to ensure broad test coverage over time.

1.  **How it Works:** The pipeline uses the current day of the year to mathematically select a user from a predefined list: `HMCTSAdmin`, `CPSAdmin`, `CPSProsecutor`, `DefenceAdvocateA`, `FullTimeJudge`, and `ProbationStaff`. This is a stateless approach, meaning it doesn't rely on saving information from previous builds.
2.  **Implementation:** The selected user's name is set as the `TEST_USER` environment variable.
3.  **Connection to Tests:** Test suites using the "Dynamic Test Generation" pattern will use this `TEST_USER` as their single `currentUser` for the test run.

This rotation mechanism does **not** apply to `@regression` runs, which have their own strategy for comprehensive user coverage.

## Test Execution and Reporting

The pipeline executes the test suites based on the strategy defined above.

-   It runs the main tests in Chrome and Firefox using the `test:chrome` and `test:firefox` scripts.
-   Tests requiring special handling, such as `notes-lifecycle.spec.ts`, are run separately using dedicated Playwright projects (e.g., `notes-chrome`) that are configured to use a single worker.
-   After execution, the pipeline publishes both the standard Playwright HTML report and a more detailed Allure report, which can be accessed from the Jenkins build results page.

## Secrets

The pipeline loads secrets from Azure Key Vault to be used as environment variables for credentials, URLs, and other sensitive data. Secrets are configured in `Jenkinsfile_nightly` as follows:

```groovy
def secrets = [
  'dcs-automation-bts-stg': [
    secret('ADMIN-HMCTS-PASSWORD', 'HMCTS_ADMIN_PASSWORD'),
    secret('CPSADMIN-PASSWORD', 'CPS_ADMIN_PASSWORD'),
    secret('CPSPROSECUTOR-PASSWORD', 'CPS_PROSECUTOR_PASSWORD'),
    secret('DEFENCE-A-PASSWORD', 'DEFENCE_ADVOCATE_A_PASSWORD'),
    // ... and many others
  ]
]
```

These secrets are loaded using the `loadVaultSecrets` function at the start of the pipeline. For local development, you can populate your `.env` file by running `yarn load-secrets`.
