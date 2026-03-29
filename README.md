# API Planner — Tarefas

API REST em **Node.js** e **Express** para cadastro e gestão de tarefas (planner pessoal). Inclui **CRUD completo** de tarefas, **cadastro de usuários**, **autenticação JWT** (token com expiração de **8 horas**) e armazenamento **em memória** (arrays no código).

A documentação interativa está em **Swagger UI** em `GET /docs`.

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior

## Instalação

No diretório do projeto:

```bash
npm install
```

## Como rodar

```bash
npm start
```

Por padrão o servidor sobe em `http://localhost:3000`. Para outra porta:

```bash
set PORT=4000
npm start
```

(No PowerShell: `$env:PORT=4000; npm start`)

## Testes

Os testes automatizados ficam na pasta `tests` e utilizam **Mocha**, **Supertest** e **Chai**.

### Instalar dependências de teste
```bash
cd tests
npm install
```

### Rodar os testes de autenticação
```bash
npx mocha auth/auth.test.js
```

### Rodar os testes de usuários
```bash
npx mocha usuarios/usuarios.test.js
```

### Rodar os testes de tarefas
```bash
npx mocha tarefas/tarefas.test.js
```

### Rodar todos os testes
```bash
npx mocha **/*.test.js
```

## Usuário de teste (em memória)

| Campo | Valor              |
|-------|--------------------|
| Email | `admin@planner.com` |
| Senha | `admin123`         |

## Como usar a API

### 1. Documentação (Swagger UI)

Abra no navegador: [http://localhost:3000/docs](http://localhost:3000/docs)

Lá você pode ver todos os endpoints, modelos de request/response e testar chamadas (use **Authorize** com o token JWT após o login).

### 2. Obter token JWT

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@planner.com",
  "senha": "admin123"
}
```

Resposta (exemplo): `token`, `tipo`, `expiraEm`, `usuario`.

### 3. Cadastrar novo usuário

```http
POST /usuarios
Content-Type: application/json

{
  "email": "novo@exemplo.com",
  "senha": "umaSenhaSegura"
}
```

### 4. Tarefas (requer cabeçalho `Authorization`)

Todas as rotas abaixo exigem:

```http
Authorization: Bearer <seu_token_jwt>
```

| Método | Caminho        | Descrição              |
|--------|----------------|------------------------|
| GET    | `/tarefas`     | Listar suas tarefas    |
| POST   | `/tarefas`     | Criar tarefa           |
| GET    | `/tarefas/:id` | Obter uma tarefa       |
| PATCH  | `/tarefas/:id` | Atualizar parcialmente |
| DELETE | `/tarefas/:id` | Excluir                |

**Campos da tarefa:** título (obrigatório, único por usuário), descrição (opcional), prioridade (`baixa`, `média`, `alta`), prazo (ISO 8601, não pode ser no passado), status (na criação sempre `pendente`), categoria opcional (`trabalho`, `estudos`, `casa`, `pessoal`, `outro`). IDs e datas de criação/atualização são gerados automaticamente.

### Exemplo com curl (PowerShell)

Login e gravação do token em variável:

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

## Estrutura do projeto

- `src/routes` — definição das rotas
- `src/controllers` — entrada HTTP e respostas
- `src/services` — regras de negócio e JWT
- `src/model` — constantes e armazenamento em memória
- `src/middleware` — autenticação JWT
- `resources/openapi.yaml` — especificação OpenAPI (Swagger)

**Dica:** em clientes como o PowerShell, envie o corpo JSON em **UTF-8** quando usar acentos (por exemplo `média` em `prioridade`), para não corromper caracteres.

## Variáveis de ambiente

| Variável   | Descrição                                      |
|------------|------------------------------------------------|
| `PORT`     | Porta HTTP (padrão `3000`)                     |
| `JWT_SECRET` | Segredo para assinatura do JWT (use um valor forte em produção) |

## Licença

MIT
