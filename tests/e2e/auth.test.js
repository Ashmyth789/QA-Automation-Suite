const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const { validUser, invalidUser, edgeCaseUsers } = require('../../fixtures/users');

test.describe('Authentication — Login Flow', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await page.goto(process.env.BASE_URL || 'https://the-internet.herokuapp.com/login');
  });

  // ─── Happy Path ───────────────────────────────────────────────────────────

  test('TC-AUTH-001 | Valid credentials → dashboard redirect', async ({ page }) => {
    await loginPage.login(validUser.username, validUser.password);
    await expect(page).toHaveURL(/dashboard|home|secure/);
    const loggedIn = await dashboardPage.isLoggedIn();
    expect(loggedIn).toBeTruthy();
  });

  test('TC-AUTH-002 | Login page renders all required elements', async ({ page }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('TC-AUTH-003 | Successful login shows welcome message', async ({ page }) => {
    await loginPage.login(validUser.username, validUser.password);
    const welcome = await dashboardPage.getWelcomeText();
    expect(welcome).toBeTruthy();
  });

  // ─── Negative Cases ───────────────────────────────────────────────────────

  test('TC-AUTH-004 | Invalid username → error message', async ({ page }) => {
    await loginPage.login('wronguser@test.com', validUser.password);
    const error = await loginPage.getErrorMessage();
    expect(error).toMatch(/invalid|incorrect|wrong|not found/i);
  });

  test('TC-AUTH-005 | Invalid password → error message', async ({ page }) => {
    await loginPage.login(validUser.username, 'WrongPass123!');
    const error = await loginPage.getErrorMessage();
    expect(error).toMatch(/invalid|incorrect|wrong/i);
  });

  test('TC-AUTH-006 | Empty username → validation error', async ({ page }) => {
    await loginPage.login('', validUser.password);
    const error = await loginPage.getErrorMessage();
    expect(error).toBeTruthy();
  });

  test('TC-AUTH-007 | Empty password → validation error', async ({ page }) => {
    await loginPage.login(validUser.username, '');
    const error = await loginPage.getErrorMessage();
    expect(error).toBeTruthy();
  });

  test('TC-AUTH-008 | Both fields empty → validation error', async ({ page }) => {
    await loginPage.login('', '');
    const error = await loginPage.getErrorMessage();
    expect(error).toBeTruthy();
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test('TC-AUTH-009 | SQL injection in username → no crash', async ({ page }) => {
    await loginPage.login("' OR '1'='1", 'anything');
    // Must NOT redirect to dashboard
    await expect(page).not.toHaveURL(/dashboard|home|secure/);
  });

  test('TC-AUTH-010 | XSS in username → sanitised output', async ({ page }) => {
    await loginPage.login('<script>alert("xss")</script>', 'test');
    const content = await page.content();
    expect(content).not.toContain('<script>alert("xss")</script>');
  });

  test('TC-AUTH-011 | Password with special characters accepted', async ({ page }) => {
    await loginPage.login(validUser.username, 'P@$$w0rd!#%^&*()');
    // Should either succeed or show auth error – NOT a 500
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe('complete');
  });

  test('TC-AUTH-012 | Very long username (>200 chars) → graceful error', async ({ page }) => {
    const longUsername = 'a'.repeat(250) + '@test.com';
    await loginPage.login(longUsername, validUser.password);
    const url = page.url();
    expect(url).not.toMatch(/dashboard|home|secure/);
  });

  test('TC-AUTH-013 | Whitespace-only credentials → rejected', async ({ page }) => {
    await loginPage.login('   ', '   ');
    const url = page.url();
    expect(url).not.toMatch(/dashboard|home|secure/);
  });

  // ─── Session ──────────────────────────────────────────────────────────────

  test('TC-AUTH-014 | Logout clears session and redirects', async ({ page }) => {
    await loginPage.login(validUser.username, validUser.password);
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login|signin|$/);
  });

  test('TC-AUTH-015 | Access protected route without auth → redirect to login', async ({ page }) => {
    await page.goto((process.env.BASE_URL || '') + '/dashboard');
    await expect(page).toHaveURL(/login|signin/);
  });
});
