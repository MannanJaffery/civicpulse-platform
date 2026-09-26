import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 50 },  // Spike to 50 users to trigger HPA
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8000';

export default function () {
  const payload = JSON.stringify({
    text: "Heavy sewage overflowing near Street 4 market since yesterday morning, foul smell spreading.",
    location: "Sector G-9/4, Islamabad",
    reporter_contact: "citizen@example.com"
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Submit complaint
  const res = http.post(`${BASE_URL}/api/complaints`, payload, params);
  check(res, {
    'status is 201 or 429': (r) => r.status === 201 || r.status === 429,
  });

  // Query stats
  const statsRes = http.get(`${BASE_URL}/api/stats`);
  check(statsRes, {
    'stats status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
