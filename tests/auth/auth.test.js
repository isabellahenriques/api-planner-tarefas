const request = require('supertest'); // Importa o supertest para fazer requisições HTTP à API
const { expect } = require('chai'); // Importa o expect do chai para fazer as asserções (verificações)
const app = require('../../src/app'); // Importa o app para que o supertest consiga fazer as requisições

// Agrupa todos os testes relacionados à autenticação
describe('Auth', () => {

    // Agrupa os testes do endpoint POST /auth/login
    describe('POST /auth/login', () => {

        // Cenário de sucesso — login com credenciais corretas
        it('deve fazer login com sucesso', async () => {
            const payload = { email: 'admin@planner.com', senha: 'admin123' };
            console.log('Payload enviado:', payload);

            const res = await request(app).post('/auth/login').send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
        });

        // Cenário de erro — senha incorreta
        it('deve rejeitar login com senha errada', async () => {
            const payload = { email: 'admin@planner.com', senha: 'senhaerrada' };
            console.log('Payload enviado:', payload);

            const res = await request(app).post('/auth/login').send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(401);
        });

        // Cenário de erro — campos obrigatórios ausentes
        it('deve rejeitar login sem email e senha', async () => {
            const payload = {};
            console.log('Payload enviado:', payload);

            const res = await request(app).post('/auth/login').send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(400);
        });

    });

});