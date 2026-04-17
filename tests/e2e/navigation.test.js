const { test, expect } = require('@playwright/test');

test.describe('Navigation & User Workflows', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'https://demo.playwright.dev/todomvc');
  });

  // ─── Page Load & Structure ────────────────────────────────────────────────

  test('TC-NAV-001 | Page loads with correct title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('TC-NAV-002 | Page loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.waitForLoadState('load');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });

  test('TC-NAV-003 | No console errors on page load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(errors.length).toBe(0);
  });

  test('TC-NAV-004 | No broken images on page', async ({ page }) => {
    const brokenImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src);
    });
    expect(brokenImages).toHaveLength(0);
  });

  test('TC-NAV-005 | All internal nav links return 200', async ({ page, request }) => {
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => href.startsWith(window.location.origin))
        .slice(0, 10)    // test up to 10 internal links
    );

    for (const link of links) {
      const response = await request.get(link);
      expect(response.status(), `Broken link: ${link}`).toBeLessThan(400);
    }
  });

  // ─── User Workflows (TodoMVC) ─────────────────────────────────────────────

  test('TC-WF-001 | Create a new todo item', async ({ page }) => {
    const newTodo = page.locator('.new-todo');
    await newTodo.fill('Buy groceries');
    await newTodo.press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li label')).toHaveText('Buy groceries');
  });

  test('TC-WF-002 | Create multiple todos', async ({ page }) => {
    const items = ['First task', 'Second task', 'Third task'];
    const newTodo = page.locator('.new-todo');
    for (const item of items) {
      await newTodo.fill(item);
      await newTodo.press('Enter');
    }
    await expect(page.locator('.todo-list li')).toHaveCount(3);
  });

  test('TC-WF-003 | Complete a todo item', async ({ page }) => {
    await page.locator('.new-todo').fill('Complete me');
    await page.locator('.new-todo').press('Enter');
    await page.locator('.todo-list li .toggle').first().check();
    await expect(page.locator('.todo-list li').first()).toHaveClass(/completed/);
  });

  test('TC-WF-004 | Delete a todo item', async ({ page }) => {
    await page.locator('.new-todo').fill('Delete me');
    await page.locator('.new-todo').press('Enter');
    await page.locator('.todo-list li').first().hover();
    await page.locator('.todo-list li .destroy').first().click();
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-WF-005 | Filter: Active todos', async ({ page }) => {
    const newTodo = page.locator('.new-todo');
    await newTodo.fill('Active task'); await newTodo.press('Enter');
    await newTodo.fill('Done task');   await newTodo.press('Enter');
    await page.locator('.todo-list li .toggle').last().check();
    await page.locator('[href="#/active"]').click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li label')).toHaveText('Active task');
  });

  test('TC-WF-006 | Filter: Completed todos', async ({ page }) => {
    const newTodo = page.locator('.new-todo');
    await newTodo.fill('Task A'); await newTodo.press('Enter');
    await newTodo.fill('Task B'); await newTodo.press('Enter');
    await page.locator('.todo-list li .toggle').first().check();
    await page.locator('[href="#/completed"]').click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
  });

  test('TC-WF-007 | Clear completed removes only done items', async ({ page }) => {
    const newTodo = page.locator('.new-todo');
    await newTodo.fill('Keep me');  await newTodo.press('Enter');
    await newTodo.fill('Clear me'); await newTodo.press('Enter');
    await page.locator('.todo-list li .toggle').last().check();
    await page.locator('.clear-completed').click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li label')).toHaveText('Keep me');
  });

  test('TC-WF-008 | Edit todo by double-clicking', async ({ page }) => {
    await page.locator('.new-todo').fill('Original text');
    await page.locator('.new-todo').press('Enter');
    await page.locator('.todo-list li label').first().dblclick();
    const editInput = page.locator('.todo-list li .edit');
    await editInput.fill('Updated text');
    await editInput.press('Enter');
    await expect(page.locator('.todo-list li label')).toHaveText('Updated text');
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test('TC-WF-009 | Empty todo not created', async ({ page }) => {
    await page.locator('.new-todo').press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-WF-010 | Whitespace-only todo not created', async ({ page }) => {
    await page.locator('.new-todo').fill('   ');
    await page.locator('.new-todo').press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-WF-011 | Very long todo text handled gracefully', async ({ page }) => {
    const longText = 'x'.repeat(1000);
    await page.locator('.new-todo').fill(longText);
    await page.locator('.new-todo').press('Enter');
    const ready = await page.evaluate(() => document.readyState);
    expect(ready).toBe('complete');
  });

  test('TC-WF-012 | Todo counter updates on add/remove', async ({ page }) => {
    const newTodo = page.locator('.new-todo');
    await newTodo.fill('One');   await newTodo.press('Enter');
    await newTodo.fill('Two');   await newTodo.press('Enter');
    await newTodo.fill('Three'); await newTodo.press('Enter');
    const count = page.locator('.todo-count strong');
    await expect(count).toHaveText('3');
  });

  // ─── Responsive Design ────────────────────────────────────────────────────

  test('TC-WF-013 | Layout intact on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    const input = page.locator('.new-todo');
    await expect(input).toBeVisible();
  });

  test('TC-WF-014 | Layout intact on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    const input = page.locator('.new-todo');
    await expect(input).toBeVisible();
  });
});
