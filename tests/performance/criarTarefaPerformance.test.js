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


    const payload = JSON.stringify({
        titulo: `Tarefa VU${__VU} ITER${__ITER} ${Date.now()}`,
        prioridade: 'alta',
        prazo: '2027-01-01T10:00:00.000Z',
        categoria: 'estudos',
    });

    const res = http.post(BASE_URL + '/tarefas', payload, params);

    check(res, {
        'status é 201': (r) => r.status === 201,
        'retornou id da tarefa': (r) => JSON.parse(r.body).id !== undefined,
    });

    sleep(1);
}