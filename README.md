# API Planner — Tarefas

API REST em Node.js e Express para cadastro e gestão de tarefas pessoais (planner). Desenvolvida como parte do **Desafio #4 da Mentoria M2.0**.

Inclui CRUD completo de tarefas, cadastro de usuários, autenticação JWT com expiração de 8 horas e armazenamento em memória.

A documentação interativa está disponível via Swagger UI em `GET /docs`.

---

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior

---

## Instalação

```bash
npm install
```

---

## Como rodar

```bash
npm start
```

O servidor sobe em `http://localhost:3000` por padrão.

Para rodar em outra porta:

```bash
# CMD
set PORT=4000 && npm start

# PowerShell
$env:PORT=4000; npm start
```

---

## Usuário de teste

| Campo | Valor |
|-------|-------|
| Email | `admin@planner.com` |
| Senha | `admin123` |

---

## Como usar a API

### 1. Acesse a documentação Swagger

```
http://localhost:3000/docs
```

Lá você encontra todos os endpoints, modelos de request/response e pode testar as chamadas diretamente. Após o login, clique em **Authorize** e cole o token JWT.

### 2. Faça login e obtenha o token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@planner.com",
  "senha": "admin123"
}
```

### 3. Cadastre um novo usuário

```http
POST /usuarios
Content-Type: application/json

{
  "email": "novo@exemplo.com",
  "senha": "umaSenhaSegura"
}
```

### 4. Use os endpoints de tarefas

Todas as rotas abaixo exigem o cabeçalho:

```http
Authorization: Bearer <seu_token_jwt>
```

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/tarefas` | Listar tarefas |
| POST | `/tarefas` | Criar tarefa |
| GET | `/tarefas/:id` | Buscar tarefa por ID |
| PATCH | `/tarefas/:id` | Atualizar parcialmente |
| DELETE | `/tarefas/:id` | Excluir tarefa |

**Campos da tarefa:**

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `titulo` | Sim | Único por usuário |
| `prioridade` | Sim | `baixa`, `média` ou `alta` |
| `prazo` | Sim | ISO 8601, deve ser data futura |
| `descricao` | Não | Texto livre |
| `status` | Automático | Sempre inicia como `pendente` |
| `categoria` | Não | `trabalho`, `estudos`, `casa`, `pessoal` ou `outro` |

---

## Testes automatizados

Os testes ficam na pasta `tests` e utilizam **Mocha**, **Supertest** e **Chai**.

### Instalar dependências

```bash
cd tests
npm install
```

### Rodar os testes

```bash
# Autenticação
npx mocha auth/auth.test.js

# Usuários
npx mocha usuarios/usuarios.test.js

# Tarefas
npx mocha tarefas/tarefas.test.js

# Todos os testes
npx mocha **/*.test.js
```

### Cenários cobertos

| Cenário | Status esperado |
|---------|-----------------|
| **Autenticação** | |
| Login com sucesso | 200 |
| Login com senha errada | 401 |
| Login sem email e senha | 400 |
| **Usuários** | |
| Cadastrar com sucesso | 201 |
| Cadastrar com email já existente | 409 |
| Cadastrar sem campos obrigatórios | 400 |
| **Tarefas — POST** | |
| Criar com sucesso | 201 |
| Criar sem título | 400 |
| Criar com prazo no passado | 400 |
| Criar com prioridade inválida | 400 |
| Criar sem autenticação | 401 |
| Criar com título duplicado | 409 |
| **Tarefas — GET** | |
| Listar com sucesso | 200 |
| Listar sem autenticação | 401 |
| **Tarefas — PATCH** | |
| Atualizar com sucesso | 200 |
| Atualizar com prazo no passado | 400 |
| Atualizar sem autenticação | 401 |
| **Tarefas — DELETE** | |
| Excluir com sucesso | 204 |
| Excluir sem autenticação | 401 |
| Excluir tarefa inexistente | 404 |

---

## Testes de performance

Os testes de performance ficam na pasta `tests/performance` e utilizam **k6**.

### Instalar o k6

```bash
winget install k6 --source winget
```

### Rodar os testes de performance

```bash
# Login
k6 run tests/performance/loginPerformance.test.js

# Criar tarefa
k6 run tests/performance/criarTarefaPerformance.test.js

# Listar tarefas
k6 run tests/performance/listarTarefasPerformance.test.js

# Atualizar tarefa
k6 run tests/performance/atualizarTarefaPerformance.test.js

# Excluir tarefa
k6 run tests/performance/excluirTarefaPerformance.test.js
```

### Resultados obtidos

| Teste | Checks | Falhas | Tempo médio |
|-------|--------|--------|-------------|
| Login | 418/418 | 0% | 231ms |
| Criar tarefa | 320/320 | 0% | 308ms |
| Listar tarefas | 362/362 | 0% | 210ms |
| Atualizar tarefa | 420/420 | 0% | 286ms |
| Excluir tarefa | 258/258 | 0% | 338ms |

Configuração: **10 usuários simultâneos** por **30 segundos** com thresholds de `p(90)<3000ms` e `max<5000ms`.

---

## Estrutura do projeto

```
api-planner-tarefas/
├── src/
│   ├── controllers/    — entrada HTTP e respostas
│   ├── services/       — regras de negócio e JWT
│   ├── routes/         — definição das rotas
│   ├── model/          — constantes e armazenamento em memória
│   ├── middleware/     — autenticação JWT
│   ├── app.js
│   └── index.js
├── resources/
│   └── openapi.yaml    — especificação OpenAPI (Swagger)
├── tests/
│   ├── auth/
│   ├── usuarios/
│   ├── tarefas/
│   ├── performance/
│   ├── helpers/
│   └── utils/
├── .gitignore
├── package.json
└── README.md
```

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta HTTP | `3000` |
| `JWT_SECRET` | Segredo para assinatura do JWT | — |

---

## Exemplo com PowerShell

Login e armazenamento do token:

```powershell
$r = Invoke-RestMethod -Uri http://localhost:3000/auth/login -Method POST -ContentType "application/json" -Body '{"email":"admin@planner.com","senha":"admin123"}'
$token = $r.token
```

Criar tarefa:

```powershell
$body = @{
  titulo = "Revisar documentação"
  prioridade = "alta"
  prazo = "2026-12-31T18:00:00.000Z"
  categoria = "trabalho"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/tarefas -Method POST -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body
```

> Dica: no PowerShell, envie o JSON em UTF-8 quando usar caracteres com acento para evitar erros de encoding.

---

## Licença

MIT
