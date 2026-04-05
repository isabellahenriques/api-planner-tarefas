import http from 'k6/http';
import { sleep, check } from 'k6';
import { pegarBaseUrl } from '../utils/variaveis.js';
import { pegarParams } from '../utils/params.js';
import { obterToken } from '../helpers/autenticacao.js';

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

    const titulo = `Tarefa VU${__VU} ITER${__ITER} ${Date.now()}`;

    const criarRes = http.post(BASE_URL + '/tarefas',
        JSON.stringify({
            titulo: titulo,
            prioridade: 'média',
            prazo: '2027-01-01T10:00:00.000Z',
            categoria: 'pessoal',
        }),
        params
    );

    check(criarRes, { 'criou tarefa': (r) => r.status === 201 });

    const tarefaId = JSON.parse(criarRes.body).id;

    const res = http.del(BASE_URL + '/tarefas/' + tarefaId, null, params);

    check(res, { 'status é 204': (r) => r.status === 204 });

    sleep(1);
}