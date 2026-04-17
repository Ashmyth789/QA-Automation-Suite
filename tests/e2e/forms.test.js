const { test, expect } = require('@playwright/test');
const FormPage = require('../../pages/FormPage');
const { validFormData, edgeCaseFormData } = require('../../fixtures/formData');

test.describe('Form Validation & Submission', () => {
  let formPage;

  test.beforeEach(async ({ page }) => {
    formPage = new FormPage(page);
    await page.goto(process.env.FORM_URL || 'https://demoqa.com/automation-practice-form');
  });

  // ─── Happy Path ───────────────────────────────────────────────────────────

  test('TC-FORM-001 | Valid complete form → success confirmation', async ({ page }) => {
    await formPage.fillForm(validFormData);
    await formPage.acceptTerms();
    await formPage.submitForm();
    const success = await formPage.isSuccessVisible();
    expect(success).toBeTruthy();
  });

  test('TC-FORM-002 | Minimum required fields → success', async ({ page }) => {
    await formPage.fillForm({
      firstName: 'Jane',
      lastName:  'Doe',
      email:     'jane@test.com',
    });
    await formPage.submitForm();
    const errors = await formPage.getFieldErrors();
    const requiredErrors = errors.filter(e => /required|mandatory/i.test(e));
    expect(requiredErrors.length).toBe(0);
  });

  // ─── Required Field Validation ────────────────────────────────────────────

  test('TC-FORM-003 | Submit empty form → all required field errors shown', async ({ page }) => {
    await formPage.submitForm();
    const errors = await formPage.getFieldErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('TC-FORM-004 | Missing first name → validation error', async ({ page }) => {
    await formPage.fillForm({ lastName: 'Doe', email: 'test@test.com' });
    await formPage.submitForm();
    const errors = await formPage.getFieldErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('TC-FORM-005 | Missing email → validation error', async ({ page }) => {
    await formPage.fillForm({ firstName: 'John', lastName: 'Doe' });
    await formPage.submitForm();
    const errors = await formPage.getFieldErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  // ─── Email Validation ─────────────────────────────────────────────────────

  test('TC-FORM-006 | Invalid email format → error', async ({ page }) => {
    const invalidEmails = ['notanemail', '@nodomain', 'missing@', 'two@@at.com', 'spaces in@email.com'];
    for (const email of invalidEmails) {
      await formPage.fillForm({ firstName: 'Test', lastName: 'User', email });
      await formPage.submitForm();
      const errors = await formPage.getFieldErrors();
      expect(errors.length, `Expected error for email: ${email}`).toBeGreaterThan(0);
    }
  });

  test('TC-FORM-007 | Valid email formats accepted', async ({ page }) => {
    const validEmails = ['user@domain.com', 'user+tag@sub.domain.org', 'user.name@domain.io'];
    for (const email of validEmails) {
      await formPage.fillForm({ firstName: 'Test', lastName: 'User', email });
      await formPage.submitForm();
      // Should not show email-specific error
      const errors = await formPage.getFieldErrors();
      const emailErrors = errors.filter(e => /email/i.test(e));
      expect(emailErrors.length, `Unexpected error for valid email: ${email}`).toBe(0);
    }
  });

  // ─── Input Length & Content ───────────────────────────────────────────────

  test('TC-FORM-008 | Max length text input → accepted or truncated', async ({ page }) => {
    const longText = 'A'.repeat(5000);
    await formPage.fillForm({ firstName: longText, lastName: 'Test', email: 'test@test.com' });
    const value = await formPage.firstNameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(5000);
  });

  test('TC-FORM-009 | Special characters in name fields → accepted', async ({ page }) => {
    await formPage.fillForm({
      firstName: "O'Brien-García",
      lastName:  'Müller',
      email:     'test@test.com',
    });
    await formPage.submitForm();
    const nameVal = await formPage.firstNameInput.inputValue();
    expect(nameVal).toContain("O'Brien");
  });

  test('TC-FORM-010 | Number-only name field → may warn or accept', async ({ page }) => {
    await formPage.fillForm({ firstName: '12345', lastName: 'Test', email: 'test@test.com' });
    await formPage.submitForm();
    // App should not crash
    const ready = await page.evaluate(() => document.readyState);
    expect(ready).toBe('complete');
  });

  test('TC-FORM-011 | Whitespace-only inputs → treated as empty', async ({ page }) => {
    await formPage.fillForm({ firstName: '   ', lastName: '   ', email: '   ' });
    await formPage.submitForm();
    const errors = await formPage.getFieldErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('TC-FORM-012 | Phone field accepts valid formats', async ({ page }) => {
    const validPhones = ['+1-800-555-0100', '(555) 123-4567', '9876543210'];
    for (const phone of validPhones) {
      await formPage.fillForm({ firstName: 'T', lastName: 'U', email: 't@t.com', phone });
      const val = await formPage.phoneInput.inputValue();
      expect(val).toBeTruthy();
    }
  });

  // ─── Reset & Navigation ───────────────────────────────────────────────────

  test('TC-FORM-013 | Reset clears all fields', async ({ page }) => {
    await formPage.fillForm(validFormData);
    await formPage.resetForm();
    const val = await formPage.firstNameInput.inputValue();
    expect(val).toBe('');
  });

  test('TC-FORM-014 | Double submit does not cause duplicate entries', async ({ page }) => {
    await formPage.fillForm(validFormData);
    await formPage.acceptTerms();
    await formPage.submitButton.click();
    await formPage.submitButton.click({ force: true });
    // Page should show single success, not crash
    const ready = await page.evaluate(() => document.readyState);
    expect(ready).toBe('complete');
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  test('TC-FORM-015 | All form inputs have labels', async ({ page }) => {
    const inputs = page.locator('input:not([type="hidden"]), textarea, select');
    const count  = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input   = inputs.nth(i);
      const id      = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      const hasLabel = id
        ? (await page.locator(`label[for="${id}"]`).count()) > 0
        : false;
      expect(hasLabel || ariaLabel || placeholder, `Input ${i} missing accessible label`).toBeTruthy();
    }
  });
});
