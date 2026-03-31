import http from 'k6/http';
import { sleep, check } from 'k6';
import { pegarBaseUrl } from '../utils/variaveis.js';

const BASE_URL = pegarBaseUrl();

export const options = {
    // Stages — define a rampa de usuários virtuais
    stages: [
        { duration: '5s', target: 10 },  // sobe para 10 usuários em 5 segundos
        { duration: '20s', target: 10 }, // mantém 10 usuários por 20 segundos
        { duration: '5s', target: 0 },   // desce para 0 usuários em 5 segundos
    ],
    // Thresholds — critérios de aprovação do teste
    thresholds: {
        http_req_duration: ['p(90)<3000', 'max<5000'], // 90% das requisições em menos de 3s
        http_req_failed: ['rate<0.01'],                // menos de 1% de falhas
    },
};

export default function () {
    // Cada usuário virtual faz seu próprio login
    const loginRes = http.post(BASE_URL + '/auth/login',
        JSON.stringify({ email: 'admin@planner.com', senha: 'admin123' }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    // Obtém o token do usuário virtual
    const token = JSON.parse(loginRes.body).token;

    // Cabeçalhos com autenticação
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    };

    // Título único usando VU + ITER + timestamp para evitar duplicatas
    const titulo = `Tarefa VU${__VU} ITER${__ITER} ${Date.now()}`;

    // Cria a tarefa
    const criarRes = http.post(BASE_URL + '/tarefas',
        JSON.stringify({
            titulo: titulo,
            prioridade: 'média', // com acento conforme a API espera
            prazo: '2027-01-01T10:00:00.000Z',
            categoria: 'pessoal',
        }),
        params
    );

    // Valida a criação da tarefa
    check(criarRes, { 'criou tarefa': (r) => r.status === 201 });

    // Obtém o ID da tarefa criada
    const tarefaId = JSON.parse(criarRes.body).id;

    // Exclui a tarefa criada
    const res = http.del(BASE_URL + '/tarefas/' + tarefaId, null, params);

    // Valida a exclusão da tarefa
    check(res, { 'status é 204': (r) => r.status === 204 });

    sleep(1);
}