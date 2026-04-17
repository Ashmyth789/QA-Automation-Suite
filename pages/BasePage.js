class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(path);
  }

  async getTitle() {
    return this.page.title();
  }

  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async isVisible(selector) {
    return this.page.locator(selector).isVisible();
  }

  async clickElement(selector) {
    await this.page.locator(selector).click();
  }

  async fillInput(selector, value) {
    await this.page.locator(selector).fill(value);
  }

  async getText(selector) {
    return this.page.locator(selector).textContent();
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = BasePage;
