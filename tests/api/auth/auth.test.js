const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../src/app');
const postLogin = require('../../fixtures/postLogin.json');

describe('Auth', () => {

    describe('POST /auth/login', () => {
        const path = '/auth/login';

        it('deve fazer login com sucesso', async () => {
            const res = await request(app).post(path).send(postLogin);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
        });

        it('deve rejeitar login com senha errada', async () => {
            const payload = {
                ...postLogin,
                senha: 'senhaerrada'
            };
            
            const res = await request(app).post(path).send(payload);

            expect(res.status).to.equal(401);
        });

        it('deve rejeitar login sem email e senha', async () => {
            const payload = {};

            const res = await request(app).post(path).send(payload);

            expect(res.status).to.equal(400);
        });
    });
});