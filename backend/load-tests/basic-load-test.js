import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 500 },   // Ramp up to 500 users
    { duration: '2m', target: 500 },   // Stay at 500 users
    { duration: '1m', target: 1000 },  // Ramp up to 1000 users
    { duration: '2m', target: 1000 },  // Stay at 1000 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    errors: ['rate<0.1'],              // Custom error rate should be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'loadtest1@example.com', password: 'TestPassword123!' },
  { email: 'loadtest2@example.com', password: 'TestPassword123!' },
  { email: 'loadtest3@example.com', password: 'TestPassword123!' },
];

export function setup() {
  // Register test users if they don't exist
  testUsers.forEach((user) => {
    http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
      email: user.email,
      username: user.email.split('@')[0],
      password: user.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  return { users: testUsers };
}

export default function (data) {
  // Select a random user
  const user = data.users[Math.floor(Math.random() * data.users.length)];

  // 1. Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const loginSuccess = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login returns token': (r) => JSON.parse(r.body).token !== undefined,
  });

  errorRate.add(!loginSuccess);

  if (!loginSuccess) {
    return;
  }

  const token = JSON.parse(loginRes.body).token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  sleep(1);

  // 2. Get user progress
  const progressRes = http.get(`${BASE_URL}/api/progress`, {
    headers: authHeaders,
  });

  check(progressRes, {
    'progress status is 200': (r) => r.status === 200,
    'progress response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // 3. Get quests
  const questsRes = http.get(`${BASE_URL}/api/quests`, {
    headers: authHeaders,
  });

  check(questsRes, {
    'quests status is 200': (r) => r.status === 200,
    'quests response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // 4. Get chapters
  const chaptersRes = http.get(`${BASE_URL}/api/chapters`, {
    headers: authHeaders,
  });

  check(chaptersRes, {
    'chapters status is 200': (r) => r.status === 200,
    'chapters response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // 5. Create a repository
  const createRepoRes = http.post(`${BASE_URL}/api/git/repository/create`, JSON.stringify({
    initialFiles: {
      'README.md': { content: '# Test Repository', modified: false },
    },
  }), {
    headers: authHeaders,
  });

  const createRepoSuccess = check(createRepoRes, {
    'create repo status is 200': (r) => r.status === 200,
    'create repo returns id': (r) => JSON.parse(r.body).data?.repositoryId !== undefined,
  });

  if (!createRepoSuccess) {
    return;
  }

  const repositoryId = JSON.parse(createRepoRes.body).data.repositoryId;

  sleep(1);

  // 6. Execute Git commands
  const commands = [
    'git status',
    'git add README.md',
    'git commit -m "Initial commit"',
    'git log',
  ];

  commands.forEach((command) => {
    const cmdRes = http.post(`${BASE_URL}/api/git/execute`, JSON.stringify({
      repositoryId,
      command,
    }), {
      headers: authHeaders,
    });

    const cmdSuccess = check(cmdRes, {
      [`${command} status is 200`]: (r) => r.status === 200,
      [`${command} response time < 200ms`]: (r) => r.timings.duration < 200,
    });

    errorRate.add(!cmdSuccess);

    sleep(0.5);
  });

  sleep(2);
}

export function teardown(data) {
  console.log('Load test completed');
}
