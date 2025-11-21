import http from 'k6/http';
import { check, sleep } from 'k6';

// Stress test - push system beyond normal capacity
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 300 },   // Ramp up to 300 users
    { duration: '5m', target: 300 },   // Stay at 300 users
    { duration: '2m', target: 400 },   // Ramp up to 400 users
    { duration: '5m', target: 400 },   // Stay at 400 users
    { duration: '10m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.05'],    // Error rate should be less than 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate various user actions
  const actions = [
    () => http.get(`${BASE_URL}/health`),
    () => http.get(`${BASE_URL}/api/chapters`),
    () => http.get(`${BASE_URL}/api/quests`),
    () => http.get(`${BASE_URL}/api/achievements`),
  ];

  // Execute random action
  const action = actions[Math.floor(Math.random() * actions.length)];
  const res = action();

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(Math.random() * 3); // Random sleep between 0-3 seconds
}
