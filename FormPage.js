// pages/FormPage.js
const BasePage = require('./BasePage');

class FormPage extends BasePage {
  constructor(page) {
    super(page);

    // Form fields
    this.firstNameInput  = page.locator('[name="firstName"], #firstName, [data-testid="first-name"]');
    this.lastNameInput   = page.locator('[name="lastName"],  #lastName,  [data-testid="last-name"]');
    this.emailInput      = page.locator('[name="email"],     #email,     [data-testid="email"]');
    this.phoneInput      = page.locator('[name="phone"],     #phone,     [data-testid="phone"]');
    this.messageTextarea = page.locator('[name="message"],   #message,   [data-testid="message"]');
    this.categorySelect  = page.locator('[name="category"],  #category,  [data-testid="category"]');
    this.termsCheckbox   = page.locator('[name="terms"],     #terms,     [data-testid="terms"]');
    this.submitButton    = page.locator('[type="submit"],    [data-testid="submit"]');
    this.resetButton     = page.locator('[type="reset"],     [data-testid="reset"]');

    // Feedback
    this.successBanner   = page.locator('.success-banner, [data-testid="form-success"], .alert-success');
    this.errorSummary    = page.locator('.error-summary,  [data-testid="form-error"],   .alert-danger');
    this.fieldErrors     = page.locator('.field-error, .invalid-feedback, [class*="error"]');
  }

  async fillForm({ firstName, lastName, email, phone, message, category }) {
    if (firstName)  await this.firstNameInput.fill(firstName);
    if (lastName)   await this.lastNameInput.fill(lastName);
    if (email)      await this.emailInput.fill(email);
    if (phone)      await this.phoneInput.fill(phone);
    if (message)    await this.messageTextarea.fill(message);
    if (category)   await this.categorySelect.selectOption(category);
  }

  async submitForm() {
    await this.submitButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async resetForm() {
    await this.resetButton.click();
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  async getFieldErrors() {
    return this.fieldErrors.allTextContents();
  }

  async isSuccessVisible() {
    return this.successBanner.isVisible();
  }

  async getSuccessMessage() {
    await this.successBanner.waitFor({ timeout: 5000 });
    return this.successBanner.textContent();
  }
}

module.exports = FormPage;
