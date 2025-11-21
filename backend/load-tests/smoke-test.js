import http from 'k6/http';
import { check, sleep } from 'k6';

// Smoke test - minimal load to verify system works
export const options = {
  vus: 1, // 1 virtual user
  duration: '1m', // Run for 1 minute
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check has ok status': (r) => JSON.parse(r.body).status === 'ok',
  });

  sleep(1);

  // Get chapters (public endpoint)
  const chaptersRes = http.get(`${BASE_URL}/api/chapters`);
  check(chaptersRes, {
    'chapters status is 200': (r) => r.status === 200,
    'chapters response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Get quests (public endpoint)
  const questsRes = http.get(`${BASE_URL}/api/quests`);
  check(questsRes, {
    'quests status is 200': (r) => r.status === 200,
    'quests response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
