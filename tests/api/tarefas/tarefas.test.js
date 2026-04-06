const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../src/app');
const { obterToken } = require('../helpers/autenticacao.js');

let token;
let tarefaId;

beforeEach(async () => {
    token = await obterToken();
});

describe('Tarefas', () => {
    const path = '/tarefas';

    describe('POST /tarefas', () => {

        it('deve criar uma tarefa com sucesso', async () => {
            const payload = {
                titulo: 'Estudar testes automatizados',
                prioridade: 'alta',
                prazo: '2027-01-01T10:00:00.000Z',
                descricao: 'Focar em Mocha, Supertest e Chai',
                categoria: 'estudos'
            };

            const res = await request(app)
                .post(path)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            tarefaId = res.body.id;

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('id');
            expect(res.body.titulo).to.equal('Estudar testes automatizados');
        });

        it('deve rejeitar tarefa sem título', async () => {
            const payload = {
                prioridade: 'alta',
                prazo: '2027-01-01T10:00:00.000Z'
            };

            const res = await request(app)
                .post(path)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            expect(res.status).to.equal(400);
        });

        it('deve rejeitar tarefa com prazo no passado', async () => {
            const payload = {
                titulo: 'Tarefa com prazo passado',
                prioridade: 'media',
                prazo: '2020-01-01T10:00:00.000Z'
            };

            const res = await request(app)
                .post(path)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            expect(res.status).to.equal(400);
        });

        it('deve rejeitar tarefa com prioridade inválida', async () => {
            const payload = {
                titulo: 'Tarefa com prioridade errada',
                prioridade: 'urgente',
                prazo: '2027-01-01T10:00:00.000Z'
            };

            const res = await request(app)
                .post(path)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            expect(res.status).to.equal(400);
        });

        it('deve rejeitar tarefa sem autenticação', async () => {
            const payload = {
                titulo: 'Tarefa sem token',
                prioridade: 'baixa',
                prazo: '2027-01-01T10:00:00.000Z'
            };

            const res = await request(app)
                .post(path)
                .send(payload);

            expect(res.status).to.equal(401);
        });

        it('deve rejeitar tarefa com título duplicado', async () => {
            const payload = {
                titulo: 'Estudar testes automatizados',
                prioridade: 'baixa',
                prazo: '2027-01-01T10:00:00.000Z'
            };

            const res = await request(app)
                .post(path)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            expect(res.status).to.equal(409);
        });
    });

    describe('GET /tarefas', () => {

        it('deve listar tarefas com sucesso', async () => {
            const res = await request(app)
                .get(path)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('deve rejeitar listagem sem autenticação', async () => {
            const res = await request(app).get(path);

            expect(res.status).to.equal(401);
        });

    });

    describe('PATCH /tarefas/:id', () => {

        it('deve atualizar uma tarefa com sucesso', async () => {
            const payload = {
                prioridade: 'baixa',
                descricao: 'Descrição atualizada'
            };

            const res = await request(app)
                .patch(`${path}/${tarefaId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            expect(res.status).to.equal(200);
            expect(res.body.prioridade).to.equal('baixa');
        });

        it('deve rejeitar atualização com prazo no passado', async () => {
            const payload = {
                prazo: '2020-01-01T10:00:00.000Z'
            };

            const res = await request(app)
                .patch(`${path}/${tarefaId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            expect(res.status).to.equal(400);
        });

        it('deve rejeitar atualização sem autenticação', async () => {
            const payload = {
                prioridade: 'media'
            };

            const res = await request(app)
                .patch(`${path}/${tarefaId}`)
                .send(payload);

            expect(res.status).to.equal(401);
        });
    });

    describe('DELETE /tarefas/:id', () => {
        it('deve rejeitar exclusão sem autenticação', async () => {
            const res = await request(app)
                .delete(`${path}/${tarefaId}`);

            expect(res.status).to.equal(401);
        });

        it('deve rejeitar exclusão de tarefa inexistente', async () => {
            const res = await request(app)
                .delete(`${path}/id-que-nao-existe`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(404);
        });

        it('deve excluir uma tarefa com sucesso', async () => {
            const res = await request(app)
                .delete(`${path}/${tarefaId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(204);
        });
    });
});