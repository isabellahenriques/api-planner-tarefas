const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../src/app');
const postLogin = require('../../fixtures/postLogin.json');

describe('Usuários', () => {

    describe('POST /usuarios', () => {
        const path = '/usuarios';

        it('deve cadastrar um novo usuário com sucesso', async () => {
            const payload = { email: 'novo@planner.com', senha: 'senha123' };

            const res = await request(app).post(path).send(payload);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('email');
        });

        it('deve rejeitar cadastro com email já existente', async () => {
            const payload = postLogin;

            const res = await request(app).post(path).send(payload);

            expect(res.status).to.equal(409);
        });

        it('deve rejeitar cadastro sem campos obrigatórios', async () => {
            const payload = {};

            const res = await request(app).post(path).send(payload);

            expect(res.status).to.equal(400);
        });
    });
});