import { Locator, expect } from "@playwright/test";
import { Base } from "../../../base.ts";

/**
 * Represents the "Email Verification Required" page.
 * This Page Object contains locators and a method to confirm that a newly registered user
 * will be shown this page
 * 1) Immediately after submitting their registration details prior to email verification
 * 2) As a result of any attempt to log in with their user details prior to email verification
 */

class EmailVerificationRequiredPage extends Base {
  requiresEmailVerificationTextSingular: Locator;
  requiresEmailVerificationTextPlural: Locator;

  constructor(page) {
    super(page);
    this.requiresEmailVerificationTextSingular = this.page.getByText(
      "We need to verify your email address. We have sent a verification email to the following address:",
    );

    this.requiresEmailVerificationTextPlural = this.page.getByText(
      "We need to verify your email addresses. We have sent verification emails to the following addresses:",
    );
  }

  async confirmAccountAwaitingEmailVerification(emailAddress: string) {
    await expect(
      this.requiresEmailVerificationTextSingular.or(
        this.requiresEmailVerificationTextPlural,
      ),
    ).toBeVisible();
    await expect(this.page.getByText(emailAddress)).toBeVisible();
    await expect(this.navigation.links.LogOn).toBeVisible();
  }
}
export default EmailVerificationRequiredPage;
