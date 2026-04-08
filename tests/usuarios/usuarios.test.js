const request = require("supertest"); // Importa o supertest para fazer requisições HTTP à API
const { expect } = require("chai"); // Importa o expect do chai para fazer as asserções (verificações)
const app = require("../../src/app"); // Importa o app para que o supertest consiga fazer as requisições
const { createUser } = require("../support/factories/user"); // Importa a função de criação de usuário para gerar dados de teste


// Agrupa todos os testes relacionados ao cadastro de usuários
describe("Usuários", () => {
  // Agrupa os testes do endpoint POST /usuarios
  describe("POST /usuarios", () => {
    let userPayload;

    before(() => {
      userPayload = createUser();
    });

    // Cenário de sucesso — cadastro com dados válidos
    it("deve cadastrar um novo usuário com sucesso", async () => {
      const payload = userPayload;
      console.log("Payload enviado:", payload);

      const res = await request(app).post("/usuarios").send(payload);
      console.log("Status recebido:", res.status);
      console.log("Body recebido:", res.body);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("email");
    });

    // Cenário de erro — email já cadastrado
    it("deve rejeitar cadastro com email já existente", async () => {
      const payload = userPayload;
      console.log("Payload enviado:", payload);

      const res = await request(app).post("/usuarios").send(payload);
      console.log("Status recebido:", res.status);
      console.log("Body recebido:", res.body);

      expect(res.status).to.equal(409);
    });

    // Cenário de erro — campos obrigatórios ausentes
    it("deve rejeitar cadastro sem campos obrigatórios", async () => {
      const payload = {};
      console.log("Payload enviado:", payload);

      const res = await request(app).post("/usuarios").send(payload);
      console.log("Status recebido:", res.status);
      console.log("Body recebido:", res.body);

      expect(res.status).to.equal(400);
    });

    it("deve rejeitar cadastro sem campo senha preenchido", async () => {
      const payload = { email: "admin@planner.com", senha: "" };
      const res = await request(app).post("/usuarios").send(payload);
      expect(res.status).to.equal(400);
      expect(res.body.erro).to.equal(
        "A senha é obrigatória e deve ter pelo menos 4 caracteres.",
      );
    });

     it("deve rejeitar cadastro sem campo email preenchido", async () => {
      const payload = { email: "", senha: "senha123" };
      const res = await request(app).post("/usuarios").send(payload);
      expect(res.status).to.equal(400);
      expect(res.body.erro).to.equal(
        "O email é obrigatório.",
      );
    });
  });
});
   