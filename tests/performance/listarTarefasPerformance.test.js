import http from 'k6/http';
import { sleep, check } from 'k6';
import { obterToken } from '../helpers/autenticacao.js';
import { pegarBaseUrl } from '../utils/variaveis.js';
import { pegarParams } from '../utils/params.js';

const BASE_URL = pegarBaseUrl();

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
    const token = obterToken();
    const params = pegarParams(token);

    const res = http.get(BASE_URL + '/tarefas', params);

    check(res, {
        'status é 200': (r) => r.status === 200,
        'retornou uma lista': (r) => Array.isArray(JSON.parse(r.body)),
    });

    sleep(1);
}