// Importa o módulo HTTP do k6 para fazer requisições
import http from 'k6/http';

// Importa as funções sleep e check do k6
// sleep — pausa entre iterações
// check — valida a resposta da requisição
import { sleep, check } from 'k6';

// Importa a função que obtém o token JWT
import { obterToken } from '../helpers/autenticacao.js';

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
    // Obtém o token JWT fazendo login
    const token = obterToken();

    // Cabeçalhos da requisição com autenticação
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    };

    // Título único usando VU + ITER + timestamp para evitar duplicatas
    const novaTarefa = JSON.stringify({
        titulo: `Tarefa VU${__VU} ITER${__ITER} ${Date.now()}`,
        prioridade: 'alta',
        prazo: '2027-01-01T10:00:00.000Z',
        categoria: 'trabalho',
    });

    // Faz a requisição POST para criar a tarefa
    const criarRes = http.post(BASE_URL + '/tarefas', novaTarefa, params);

    // Obtém o ID da tarefa criada
    const tarefaId = JSON.parse(criarRes.body).id;

    // Payload da atualização — apenas os campos que serão alterados
    const atualizacao = JSON.stringify({
        prioridade: 'baixa',
        descricao: 'Descrição atualizada no teste de performance',
    });

    // Faz a requisição PATCH para atualizar a tarefa
    const res = http.patch(BASE_URL + '/tarefas/' + tarefaId, atualizacao, params);

    // Valida a resposta
    check(res, {
        'status é 200': (r) => r.status === 200,
        'prioridade foi atualizada': (r) => JSON.parse(r.body).prioridade === 'baixa',
    });

    // Aguarda 1 segundo antes da próxima iteração
    sleep(1);
}