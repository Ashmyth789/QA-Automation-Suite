const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

test.describe('API Testing — REST Endpoints', () => {

  // ─── GET Requests ─────────────────────────────────────────────────────────

  test('TC-API-001 | GET /posts → 200 with array', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/posts`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('TC-API-002 | GET /posts/:id → correct schema', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/posts/1`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('body');
    expect(body).toHaveProperty('userId');
    expect(typeof body.id).toBe('number');
    expect(typeof body.title).toBe('string');
  });

  test('TC-API-003 | GET /posts/1 → response time < 2s', async ({ request }) => {
    const start = Date.now();
    const res   = await request.get(`${BASE_URL}/posts/1`);
    const elapsed = Date.now() - start;
    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(2000);
  });

  test('TC-API-004 | GET /posts?userId=1 → filtered results', async ({ request }) => {
    const res  = await request.get(`${BASE_URL}/posts?userId=1`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThan(0);
    body.forEach(post => expect(post.userId).toBe(1));
  });

  test('TC-API-005 | GET /posts/:id with non-existent ID → 404', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/posts/99999`);
    expect(res.status()).toBe(404);
  });

  test('TC-API-006 | Content-Type header is application/json', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/posts/1`);
    const ct  = res.headers()['content-type'];
    expect(ct).toMatch(/application\/json/);
  });

  // ─── POST Requests ────────────────────────────────────────────────────────

  test('TC-API-007 | POST /posts → 201 with created resource', async ({ request }) => {
    const payload = { title: 'Test Post', body: 'Test body content', userId: 1 };
    const res     = await request.post(`${BASE_URL}/posts`, { data: payload });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe(payload.title);
    expect(body.body).toBe(payload.body);
  });

  test('TC-API-008 | POST /posts with empty body → response handled', async ({ request }) => {
    const res  = await request.post(`${BASE_URL}/posts`, { data: {} });
    const code = res.status();
    // Server may return 400 or 201 with empty fields — must not be 5xx
    expect(code).toBeLessThan(500);
  });

  test('TC-API-009 | POST /posts with large payload → no 5xx', async ({ request }) => {
    const payload = {
      title:  'x'.repeat(5000),
      body:   'y'.repeat(10000),
      userId: 1,
    };
    const res = await request.post(`${BASE_URL}/posts`, { data: payload });
    expect(res.status()).toBeLessThan(500);
  });

  test('TC-API-010 | POST /posts with special chars → sanitised response', async ({ request }) => {
    const payload = { title: '<script>alert("xss")</script>', body: "'; DROP TABLE posts;--", userId: 1 };
    const res  = await request.post(`${BASE_URL}/posts`, { data: payload });
    expect(res.status()).toBeLessThan(500);
    const body = await res.json();
    if (body.title) {
      expect(body.title).not.toContain('<script>');
    }
  });

  // ─── PUT / PATCH ──────────────────────────────────────────────────────────

  test('TC-API-011 | PUT /posts/:id → 200 with full update', async ({ request }) => {
    const payload = { id: 1, title: 'Updated Title', body: 'Updated body', userId: 1 };
    const res     = await request.put(`${BASE_URL}/posts/1`, { data: payload });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Updated Title');
  });

  test('TC-API-012 | PATCH /posts/:id → 200 with partial update', async ({ request }) => {
    const res  = await request.patch(`${BASE_URL}/posts/1`, { data: { title: 'Patched title' } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Patched title');
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────

  test('TC-API-013 | DELETE /posts/:id → 200 or 204', async ({ request }) => {
    const res = await request.delete(`${BASE_URL}/posts/1`);
    expect([200, 204]).toContain(res.status());
  });

  // ─── Users Endpoint ───────────────────────────────────────────────────────

  test('TC-API-014 | GET /users → array of user objects', async ({ request }) => {
    const res  = await request.get(`${BASE_URL}/users`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    body.forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
    });
  });

  test('TC-API-015 | GET /users/:id → valid email format', async ({ request }) => {
    const res  = await request.get(`${BASE_URL}/users/1`);
    const body = await res.json();
    expect(body.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  // ─── Comments ─────────────────────────────────────────────────────────────

  test('TC-API-016 | GET /posts/1/comments → nested resource array', async ({ request }) => {
    const res  = await request.get(`${BASE_URL}/posts/1/comments`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    body.forEach(c => {
      expect(c).toHaveProperty('postId');
      expect(c.postId).toBe(1);
    });
  });

  test('TC-API-017 | GET /comments?postId=1 → same as nested route', async ({ request }) => {
    const [nested, query] = await Promise.all([
      request.get(`${BASE_URL}/posts/1/comments`).then(r => r.json()),
      request.get(`${BASE_URL}/comments?postId=1`).then(r => r.json()),
    ]);
    expect(nested.length).toBe(query.length);
  });

  // ─── Error Handling ───────────────────────────────────────────────────────

  test('TC-API-018 | Invalid route → 404', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/nonexistentroute`);
    expect(res.status()).toBe(404);
  });

  test('TC-API-019 | Response is valid JSON (not HTML error page)', async ({ request }) => {
    const res  = await request.get(`${BASE_URL}/posts/1`);
    const text = await res.text();
    expect(() => JSON.parse(text)).not.toThrow();
  });

  test('TC-API-020 | Pagination params respected', async ({ request }) => {
    const res  = await request.get(`${BASE_URL}/posts?_limit=5&_page=1`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.length).toBeLessThanOrEqual(5);
  });
});
