// Importa o módulo HTTP do k6 para fazer requisições
import http from 'k6/http';

// Importa as funções sleep e check do k6
// sleep — pausa entre iterações
// check — valida a resposta da requisição
import { sleep, check } from 'k6';

// Importa a função que retorna a URL base da API
import { pegarBaseUrl } from '../utils/variaveis.js';

// URL base da API
const BASE_URL = pegarBaseUrl();

// Configuração do teste de performance
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

// Função principal executada por cada usuário virtual
export default function () {
    // Payload enviado no login
    const payload = JSON.stringify({
        email: 'admin@planner.com',
        senha: 'admin123',
    });

    // Cabeçalhos da requisição
    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    // Faz a requisição POST para o endpoint de login
    const res = http.post(BASE_URL + '/auth/login', payload, params);

    // Valida a resposta
    check(res, {
        'status é 200': (r) => r.status === 200,
        'retornou token': (r) => JSON.parse(r.body).token !== undefined,
    });

    // Aguarda 1 segundo antes da próxima iteração
    sleep(1);
}