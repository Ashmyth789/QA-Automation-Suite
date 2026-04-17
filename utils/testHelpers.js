// utils/testHelpers.js
const { faker } = require('@faker-js/faker');

/**
 * Generate random user data for testing
 */
function generateUser(overrides = {}) {
  return {
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
    email:     faker.internet.email(),
    phone:     faker.phone.number(),
    password:  faker.internet.password({ length: 12, memorable: false }),
    ...overrides,
  };
}

/**
 * Generate random form data
 */
function generateFormData(overrides = {}) {
  return {
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
    email:     faker.internet.email(),
    phone:     faker.phone.number(),
    message:   faker.lorem.paragraph(),
    ...overrides,
  };
}

/**
 * Wait for a condition to be true
 */
async function waitForCondition(conditionFn, timeout = 5000, interval = 200) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await conditionFn()) return true;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Format test result for bug report
 */
function formatBugReport({ testName, severity, steps, expected, actual, environment }) {
  return {
    id:          `BUG-${Date.now()}`,
    title:       testName,
    severity:    severity || 'Medium',
    status:      'Open',
    environment: environment || process.env.NODE_ENV || 'development',
    reportedAt:  new Date().toISOString(),
    steps,
    expected,
    actual,
  };
}

/**
 * Slugify string for file names
 */
function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Retry an async operation
 */
async function retry(fn, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/**
 * Check if a string is a valid email
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
  generateUser,
  generateFormData,
  waitForCondition,
  formatBugReport,
  slugify,
  retry,
  isValidEmail,
};
