# 🧪 QA Automation Suite

> End-to-end testing framework using **Playwright** for UI/workflow automation and **Postman/Newman** for API testing — built to simulate real-world QA engineering workflows.

![CI](https://github.com/your-username/qa-automation-suite/actions/workflows/qa-suite.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-1.44+-green?logo=playwright)
![Postman](https://img.shields.io/badge/Postman-Newman-orange?logo=postman)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Project Overview

This suite covers:

- **End-to-end testing** of authentication, form validation, and user workflows
- **API testing** with full CRUD coverage, schema validation, and error-handling checks
- **Edge case & exploratory tests** — XSS/SQLi inputs, empty fields, large payloads, session handling
- **Cross-browser testing** — Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Bug tracking** — 15+ documented bugs in Jira-style CSV with severity, steps, and reproduction info
- **CI/CD integration** — GitHub Actions pipeline with parallel browser matrix

---

## 🗂️ Project Structure

```
qa-automation-suite/
├── tests/
│   ├── e2e/
│   │   ├── auth.test.js          # 15 auth test cases (login, logout, session, XSS/SQLi)
│   │   ├── forms.test.js         # 15 form validation test cases
│   │   └── navigation.test.js    # 14 workflow & navigation test cases
│   └── api/
│       └── api.test.js           # 20 API test cases (CRUD, schema, error handling)
├── pages/                        # Page Object Models
│   ├── BasePage.js
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   └── FormPage.js
├── fixtures/
│   ├── users.js                  # Test user data + edge-case inputs
│   └── formData.js               # Form data fixtures
├── utils/
│   └── testHelpers.js            # Shared helpers (faker, retry, bug formatter)
├── collections/
│   ├── api-test-collection.json  # Postman collection
│   └── environments/
│       └── dev.json              # Newman environment variables
├── reports/
│   └── bug-tracker.csv           # 15 documented bugs (Jira-style)
├── docs/
│   └── TEST-PLAN.md              # Full test plan with coverage matrix
├── scripts/
│   └── generate-report.js        # CLI summary report generator
├── .github/
│   └── workflows/
│       └── qa-suite.yml          # GitHub Actions CI pipeline
├── playwright.config.js
├── .env.example
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
git clone https://github.com/your-username/qa-automation-suite.git
cd qa-automation-suite

npm install
npx playwright install          # installs all browser binaries

cp .env.example .env            # configure your environment
```

### Running Tests

```bash
# All E2E tests (headless, all browsers)
npm run test:e2e

# Single browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Headed mode (watch the browser)
npm run test:headed

# Debug mode (step-through)
npm run test:debug

# API tests via Playwright request context
npx playwright test tests/api/

# API tests via Newman (Postman collection)
npm run test:api

# View interactive HTML report
npm run test:report

# Generate markdown summary
npm run generate:report
```

---

## 🧩 Test Coverage

### Authentication — `tests/e2e/auth.test.js`

| ID | Test Case | Type |
|----|-----------|------|
| TC-AUTH-001 | Valid credentials → dashboard redirect | Happy path |
| TC-AUTH-002 | Login page renders all required elements | Smoke |
| TC-AUTH-004 | Invalid username → error message | Negative |
| TC-AUTH-006 | Empty username → validation error | Negative |
| TC-AUTH-009 | SQL injection in username → no crash | Security |
| TC-AUTH-010 | XSS payload sanitised in output | Security |
| TC-AUTH-011 | Password with special characters | Edge case |
| TC-AUTH-012 | Very long username (>200 chars) | Edge case |
| TC-AUTH-014 | Logout clears session | Session |
| TC-AUTH-015 | Protected route without auth → redirect | Session |

### Form Validation — `tests/e2e/forms.test.js`

| ID | Test Case | Type |
|----|-----------|------|
| TC-FORM-001 | Valid complete form → success | Happy path |
| TC-FORM-003 | Empty form → all required errors shown | Negative |
| TC-FORM-006 | Invalid email formats rejected | Negative |
| TC-FORM-007 | Valid email formats accepted | Positive |
| TC-FORM-008 | Max length inputs (5000 chars) | Edge case |
| TC-FORM-009 | Special characters in name fields | Edge case |
| TC-FORM-011 | Whitespace-only inputs treated as empty | Edge case |
| TC-FORM-013 | Reset clears all fields | Functional |
| TC-FORM-014 | Double submit → no duplicate entries | Edge case |
| TC-FORM-015 | All inputs have accessible labels | Accessibility |

### Navigation & Workflows — `tests/e2e/navigation.test.js`

| ID | Test Case | Type |
|----|-----------|------|
| TC-NAV-001 | Page loads with correct title | Smoke |
| TC-NAV-002 | Page loads within 3 seconds | Performance |
| TC-NAV-003 | No console errors on page load | Quality |
| TC-NAV-004 | No broken images | Quality |
| TC-WF-001–008 | Full CRUD + filter workflows | Functional |
| TC-WF-009–011 | Empty / whitespace / long-text todos | Edge case |
| TC-WF-013–014 | Mobile & tablet viewport layouts | Responsive |

### API Tests — `tests/api/api.test.js`

| ID | Test Case | Type |
|----|-----------|------|
| TC-API-001 | GET /posts → 200 with array | Smoke |
| TC-API-002 | GET /posts/:id → correct schema | Contract |
| TC-API-003 | Response time < 2s | Performance |
| TC-API-007 | POST → 201 with created resource | CRUD |
| TC-API-009 | POST with large payload → no 5xx | Edge case |
| TC-API-010 | XSS payload sanitised in response | Security |
| TC-API-013 | DELETE → 200 or 204 | CRUD |
| TC-API-015 | Email field is valid format | Contract |
| TC-API-018 | Invalid route → 404 | Error handling |
| TC-API-020 | Pagination params respected | Functional |

---

## 🐛 Bug Tracker

Located at `reports/bug-tracker.csv` — 15 documented bugs in Jira-style format:

| Severity | Count |
|----------|-------|
| Critical | 3 (XSS, API 500, plaintext passwords in response) |
| High     | 6 (session, duplicate submit, SQLi, etc.) |
| Medium   | 4 (UI, counter, mobile layout, load time) |
| Low      | 2 (reset, console error) |

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and set:

```env
BASE_URL=https://your-app.com/login
API_BASE_URL=https://your-api.com
TEST_USERNAME=your-test-user
TEST_PASSWORD=your-test-password
```

Browser projects, timeouts, retries, and reporters are all configurable in `playwright.config.js`.

---

## 🔁 CI/CD

GitHub Actions runs on every push to `main`/`develop` and every weekday at 06:00 UTC:

- **Parallel matrix** across Chromium, Firefox, and WebKit
- **Artefact upload** — HTML reports and failure screenshots/videos retained for 14 days
- **Newman** runs the Postman collection and generates an HTML API report
- **Job summary** posted directly to the GitHub Actions run page

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev) | E2E browser automation |
| [Newman](https://github.com/postmanlabs/newman) | Postman CLI runner |
| [Faker.js](https://fakerjs.dev) | Randomised test data |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |
| ESLint | Code quality |

---

## 📄 License

MIT © QA Engineer
