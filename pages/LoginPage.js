// pages/LoginPage.js
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.usernameInput = page.locator('#username, [name="username"], [data-testid="username"]');
    this.passwordInput = page.locator('#password, [name="password"], [data-testid="password"]');
    this.loginButton   = page.locator('button[type="submit"], [data-testid="login-btn"], text=Login');
    this.errorMessage  = page.locator('.error-message, [data-testid="error"], .alert-danger');
    this.successMsg    = page.locator('.success, [data-testid="success"], .alert-success');
    this.rememberMe    = page.locator('#remember-me, [name="rememberMe"]');
    this.forgotPassword = page.locator('a:has-text("Forgot"), [data-testid="forgot-password"]');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async loginWithRememberMe(username, password) {
    await this.rememberMe.check();
    await this.login(username, password);
  }

  async getErrorMessage() {
    await this.errorMessage.waitFor({ timeout: 5000 });
    return this.errorMessage.textContent();
  }

  async isLoginButtonDisabled() {
    return this.loginButton.isDisabled();
  }

  async clearAndLogin(username, password) {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
    await this.login(username, password);
  }
}

module.exports = LoginPage;
