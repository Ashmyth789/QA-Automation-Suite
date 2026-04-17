const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);

    this.welcomeMessage  = page.locator('[data-testid="welcome"], .welcome-msg, h1');
    this.navMenu         = page.locator('nav, .navbar, [role="navigation"]');
    this.logoutButton    = page.locator('[data-testid="logout"], button:has-text("Logout"), a:has-text("Logout")');
    this.profileAvatar   = page.locator('[data-testid="avatar"], .avatar, .profile-pic');
    this.notificationBell = page.locator('[data-testid="notifications"], .bell-icon, [aria-label="Notifications"]');
    this.sidebarLinks    = page.locator('nav a, .sidebar a, .menu-item');
  }

  async isLoggedIn() {
    try {
      await this.welcomeMessage.waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getWelcomeText() {
    return this.welcomeMessage.textContent();
  }

  async getAllNavLinks() {
    return this.sidebarLinks.allTextContents();
  }

  async navigateTo(linkText) {
    await this.page.locator(`nav a:has-text("${linkText}"), .sidebar a:has-text("${linkText}")`).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = DashboardPage;
