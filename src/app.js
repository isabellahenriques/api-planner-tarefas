const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');

const openapiPath = path.join(__dirname, '..', 'resources', 'openapi.yaml');
const openapiRaw = fs.readFileSync(openapiPath, 'utf8');
const openapiSpec = yaml.parse(openapiRaw);

const app = express();

app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: 'Planner — API' }));

app.use('/auth', authRoutes);
app.use('/usuarios', userRoutes);
app.use('/tarefas', taskRoutes);

app.use((req, res) => {
  res.status(404).json({
    erro: 'Recurso não encontrado.',
    codigo: 'NAO_ENCONTRADO',
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      erro: 'O corpo da requisição não é um JSON válido.',
      codigo: 'JSON_INVALIDO',
    });
  }
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const body = {
    erro: err.message || 'Erro interno do servidor.',
    codigo: err.code || 'ERRO_INTERNO',
  };
  res.status(status).json(body);
});

module.exports = app;
