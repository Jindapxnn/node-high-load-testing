import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 500 },  // Ramp-up
        { duration: '30s', target: 1000 }, // Stay at 1000 users
        { duration: '10s', target: 0 },   // Ramp-down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'],
        'http_req_duration{type:direct}': ['p(95)<1500'], // DB direct must be slower  
        'http_req_duration{type:queue}': ['p(95)<300'],   // Queue must be faster
    },
};

const BASE_URL = 'http://node-app:3000/api'; 

export default function () {
    // random ways to book
    const isDirect = Math.random() < 0.5;
    
    if (isDirect) {
        group('Direct_DB_Access', function () {
            const payload = JSON.stringify({
                username: `user-${__VU}-${__ITER}`
            });
            const params = { 
                headers: { 'Content-Type': 'application/json' },
                tags: { type: 'direct' } 
            };

            const res = http.post(`${BASE_URL}/book-direct`, payload, params);
            
            check(res, {
                'direct status is 201': (r) => r.status === 201,
            });
        });
    } else {
        group('Queue_Async_Access', function () {
            const payload = JSON.stringify({
                username: `user-${__VU}-${__ITER}`
            });
            const params = { 
                headers: { 'Content-Type': 'application/json' },
                tags: { type: 'queue' } 
            };

            const res = http.post(`${BASE_URL}/book`, payload, params);

            check(res, {
                'queue status is 202': (r) => r.status === 202, 
            });
        });
    }

    sleep(0.1);
}