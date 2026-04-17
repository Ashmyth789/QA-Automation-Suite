const validUser = {
  username: process.env.TEST_USERNAME || 'tomsmith',
  password: process.env.TEST_PASSWORD || 'SuperSecretPassword!',
  email:    process.env.TEST_EMAIL    || 'tomsmith@example.com',
  role:     'user',
};

const adminUser = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'AdminPass123!',
  email:    'admin@example.com',
  role:     'admin',
};

const invalidUser = {
  username: 'nonexistent@test.com',
  password: 'WrongPassword123!',
};

const edgeCaseUsers = [
  { label: 'SQL injection',  username: "' OR '1'='1' --",   password: 'anything' },
  { label: 'XSS',            username: '<script>alert(1)</script>', password: 'test' },
  { label: 'Empty username', username: '',                   password: 'password' },
  { label: 'Empty password', username: 'user@test.com',      password: '' },
  { label: 'Spaces only',    username: '   ',                password: '   ' },
  { label: 'Very long',      username: 'a'.repeat(300),      password: 'pass' },
  { label: 'Unicode',        username: '用户名@test.com',    password: 'password' },
  { label: 'Emoji',          username: '🙂@test.com',        password: 'password' },
];

module.exports = { validUser, adminUser, invalidUser, edgeCaseUsers };
