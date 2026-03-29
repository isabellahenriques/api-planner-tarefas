const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Planner escutando em http://localhost:${PORT}`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/docs`);
});
