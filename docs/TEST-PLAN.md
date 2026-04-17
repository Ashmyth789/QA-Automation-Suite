# QA Test Plan — Web Application Testing Suite

**Version:** 1.0.0  
**Author:** QA Engineer  
**Date:** 2024-05-01  
**Status:** Active

---

## 1. Scope

This test plan covers functional, integration, API, and edge-case testing for the web application. It encompasses:

- Authentication flows (login, logout, session)
- Form validation and submission
- User workflows (CRUD, filters, navigation)
- REST API correctness (status codes, schema, error handling)
- Cross-browser and responsive design

**Out of scope:** Performance load testing, penetration testing (beyond basic input sanitisation checks), third-party integrations.

---

## 2. Test Strategy

| Layer          | Tool                        | Type                                  |
|----------------|-----------------------------|---------------------------------------|
| E2E / UI       | Playwright                  | Functional, regression, edge-case     |
| API            | Playwright request + Postman| Contract, schema, error handling      |
| Cross-browser  | Playwright projects         | Chromium, Firefox, WebKit             |
| Responsive     | Playwright viewport resize  | Mobile Chrome, Mobile Safari          |
| Bug Tracking   | CSV (Jira-style)            | Severity, reproduction steps, status  |

---

## 3. Test Environment

| Variable       | Value                                      |
|----------------|--------------------------------------------|
| `BASE_URL`     | `https://the-internet.herokuapp.com/login` |
| `API_BASE_URL` | `https://jsonplaceholder.typicode.com`     |
| `FORM_URL`     | `https://demoqa.com/automation-practice-form` |
| Node.js        | >= 18.x                                    |
| Playwright     | >= 1.44.0                                  |

---

## 4. Test Cases Summary

### 4.1 Authentication (15 Test Cases)
| ID          | Title                                      | Type          | Severity |
|-------------|--------------------------------------------|---------------|----------|
| TC-AUTH-001 | Valid credentials → dashboard redirect     | Happy path    | High     |
| TC-AUTH-004 | Invalid username → error message           | Negative      | High     |
| TC-AUTH-006 | Empty username → validation error          | Negative      | Medium   |
| TC-AUTH-009 | SQL injection in username → no crash       | Security      | Critical |
| TC-AUTH-010 | XSS in username → sanitised output         | Security      | Critical |
| TC-AUTH-014 | Logout clears session                      | Session       | High     |
| TC-AUTH-015 | Protected route without auth → redirect    | Session       | High     |

### 4.2 Form Validation (15 Test Cases)
| ID          | Title                                          | Type       | Severity |
|-------------|------------------------------------------------|------------|----------|
| TC-FORM-001 | Valid complete form → success                  | Happy path | High     |
| TC-FORM-003 | Empty form → all required errors shown         | Negative   | High     |
| TC-FORM-006 | Invalid email format → error                   | Negative   | Medium   |
| TC-FORM-008 | Max length text input → accepted/truncated     | Edge case  | Medium   |
| TC-FORM-011 | Whitespace-only inputs → treated as empty      | Edge case  | Medium   |
| TC-FORM-014 | Double submit → no duplicate entries           | Edge case  | High     |
| TC-FORM-015 | All inputs have accessible labels              | A11y       | Low      |

### 4.3 Navigation & Workflows (14 Test Cases)
| ID          | Title                                      | Type         | Severity |
|-------------|--------------------------------------------|--------------|----------|
| TC-NAV-001  | Page loads with correct title              | Smoke        | High     |
| TC-NAV-002  | Page loads within 3 seconds               | Performance  | Medium   |
| TC-NAV-003  | No console errors on load                 | Quality      | Medium   |
| TC-WF-001   | Create new todo                            | Happy path   | High     |
| TC-WF-007   | Clear completed removes only done items    | Workflow     | Medium   |
| TC-WF-008   | Edit todo by double-click                  | Workflow     | Medium   |
| TC-WF-009   | Empty todo not created                     | Edge case    | Medium   |
| TC-WF-013   | Mobile viewport layout intact             | Responsive   | Medium   |

### 4.4 API Testing (20 Test Cases)
| ID          | Title                                      | Type          | Severity |
|-------------|--------------------------------------------|---------------|----------|
| TC-API-001  | GET /posts → 200 with array                | Smoke         | High     |
| TC-API-002  | GET /posts/:id → correct schema            | Contract      | High     |
| TC-API-007  | POST /posts → 201 with created resource    | CRUD          | High     |
| TC-API-009  | POST with large payload → no 5xx           | Edge case     | Medium   |
| TC-API-010  | POST with special chars → sanitised        | Security      | High     |
| TC-API-018  | Invalid route → 404                        | Error handling| Medium   |
| TC-API-020  | Pagination params respected                | Functional    | Low      |

---

## 5. Entry & Exit Criteria

### Entry Criteria
- Application deployed to test environment
- Test data and fixtures available
- Environment variables configured

### Exit Criteria
- All P0/P1 bugs resolved
- ≥ 95% test pass rate
- No open Critical severity bugs
- Regression suite passes on all target browsers

---

## 6. Bug Severity Matrix

| Severity | Definition                               | SLA to Fix  |
|----------|------------------------------------------|-------------|
| Critical | Security vulnerability / data loss / crash | 24 hours  |
| High     | Major feature broken, no workaround       | 3 days    |
| Medium   | Feature degraded, workaround exists       | 1 sprint  |
| Low      | Minor UI issue, cosmetic                  | Backlog   |

---

## 7. Running the Suite

```bash
# Install dependencies
npm install
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run API tests (requires Newman)
npm run test:api

# Run with UI (headed mode)
npm run test:headed

# View HTML report
npm run test:report
```
