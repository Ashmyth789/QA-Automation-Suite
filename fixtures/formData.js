const validFormData = {
  firstName: 'Jane',
  lastName:  'Doe',
  email:     'jane.doe@testdomain.com',
  phone:     '+1-555-012-3456',
  message:   'This is a valid test message with sufficient length and content.',
  category:  'general',
};

const minimalFormData = {
  firstName: 'A',
  lastName:  'B',
  email:     'a@b.co',
};

const edgeCaseFormData = [
  {
    label: 'Max length inputs',
    data: {
      firstName: 'A'.repeat(100),
      lastName:  'B'.repeat(100),
      email:     'test@test.com',
      message:   'M'.repeat(2000),
    },
  },
  {
    label: 'Special characters in name',
    data: {
      firstName: "O'Brien-García",
      lastName:  'Müller-Straße',
      email:     'test@test.com',
    },
  },
  {
    label: 'Unicode in all fields',
    data: {
      firstName: '日本語',
      lastName:  'العربية',
      email:     'test@test.com',
      message:   '🎉🎊🎈 Unicode message content',
    },
  },
  {
    label: 'Numeric values in text fields',
    data: {
      firstName: '12345',
      lastName:  '67890',
      email:     'numeric@test.com',
    },
  },
  {
    label: 'HTML injection attempt',
    data: {
      firstName: '<b>Bold</b>',
      lastName:  '<img src=x onerror=alert(1)>',
      email:     'html@test.com',
    },
  },
  {
    label: 'Large message payload',
    data: {
      firstName: 'Test',
      lastName:  'User',
      email:     'large@test.com',
      message:   'Word '.repeat(1000),
    },
  },
];

const invalidEmailFormats = [
  'notanemail',
  '@nodomain.com',
  'missing@',
  'two@@at.com',
  'spaces in@email.com',
  'noDot@domain',
  '.leading@domain.com',
  'trailing.@domain.com',
];

const validEmailFormats = [
  'user@domain.com',
  'user+tag@subdomain.domain.org',
  'user.name@domain.io',
  'user123@domain123.co.uk',
  'USER@DOMAIN.COM',
];

module.exports = {
  validFormData,
  minimalFormData,
  edgeCaseFormData,
  invalidEmailFormats,
  validEmailFormats,
};
