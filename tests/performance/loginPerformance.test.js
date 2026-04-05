import http from 'k6/http';
import { sleep, check } from 'k6';
import { pegarBaseUrl } from '../utils/variaveis.js';
import { pegarParams } from '../utils/params.js';

const BASE_URL = pegarBaseUrl() + '/auth/login';

export const options = {
    stages: [
        { duration: '5s', target: 10 },
        { duration: '20s', target: 10 },
        { duration: '5s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(90)<3000', 'max<5000'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    const payload = JSON.stringify({
        email: 'admin@planner.com',
        senha: 'admin123',
    });

    const params = pegarParams();

    const res = http.post(BASE_URL, payload, params);

    check(res, {
        'status é 200': (r) => r.status === 200,
        'retornou token': (r) => JSON.parse(r.body).token !== undefined,
    });

    sleep(1);
}