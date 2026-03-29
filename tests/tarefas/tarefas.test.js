const request = require('supertest'); // Importa o supertest para fazer requisições HTTP à API
const { expect } = require('chai'); // Importa o expect do chai para fazer as asserções (verificações)
const app = require('../../src/app'); // Importa o app para que o supertest consiga fazer as requisições

// Token JWT gerado no before para ser usado nos testes autenticados
let token;
// ID da tarefa criada no primeiro teste para ser usado nos demais
let tarefaId;

// Antes de todos os testes faz login e armazena o token
before(async () => {
    const res = await request(app).post('/auth/login').send({
        email: 'admin@planner.com',
        senha: 'admin123'
    });
    token = res.body.token;
    console.log('Token gerado:', token);
});

// Agrupa todos os testes relacionados às tarefas
describe('Tarefas', () => {

    // Agrupa os testes do endpoint POST /tarefas
    describe('POST /tarefas', () => {

        // Cenário de sucesso — criar tarefa com dados válidos
        it('deve criar uma tarefa com sucesso', async () => {
            const payload = {
                titulo: 'Estudar testes automatizados',
                prioridade: 'alta',
                prazo: '2027-01-01T10:00:00.000Z',
                descricao: 'Focar em Mocha, Supertest e Chai',
                categoria: 'estudos'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .post('/tarefas')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            tarefaId = res.body.id; // Armazena o ID para usar nos próximos testes
            console.log('ID da tarefa armazenado:', tarefaId);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('id');
            expect(res.body.titulo).to.equal('Estudar testes automatizados');
        });

        // Cenário de erro — criar tarefa sem título
        it('deve rejeitar tarefa sem título', async () => {
            const payload = {
                prioridade: 'alta',
                prazo: '2027-01-01T10:00:00.000Z'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .post('/tarefas')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(400);
        });

        // Cenário de erro — prazo no passado
        it('deve rejeitar tarefa com prazo no passado', async () => {
            const payload = {
                titulo: 'Tarefa com prazo passado',
                prioridade: 'media',
                prazo: '2020-01-01T10:00:00.000Z'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .post('/tarefas')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(400);
        });

        // Cenário de erro — prioridade inválida
        it('deve rejeitar tarefa com prioridade inválida', async () => {
            const payload = {
                titulo: 'Tarefa com prioridade errada',
                prioridade: 'urgente',
                prazo: '2027-01-01T10:00:00.000Z'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .post('/tarefas')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(400);
        });

        // Cenário de erro — sem autenticação
        it('deve rejeitar tarefa sem autenticação', async () => {
            const payload = {
                titulo: 'Tarefa sem token',
                prioridade: 'baixa',
                prazo: '2027-01-01T10:00:00.000Z'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .post('/tarefas')
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(401);
        });

        // Cenário de erro — título duplicado
        it('deve rejeitar tarefa com título duplicado', async () => {
            const payload = {
                titulo: 'Estudar testes automatizados',
                prioridade: 'baixa',
                prazo: '2027-01-01T10:00:00.000Z'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .post('/tarefas')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(409);
        });

    });

    // Agrupa os testes do endpoint GET /tarefas
    describe('GET /tarefas', () => {

        // Cenário de sucesso — listar tarefas autenticado
        it('deve listar tarefas com sucesso', async () => {
            console.log('Payload enviado: nenhum (GET)');

            const res = await request(app)
                .get('/tarefas')
                .set('Authorization', `Bearer ${token}`);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        // Cenário de erro — listar sem autenticação
        it('deve rejeitar listagem sem autenticação', async () => {
            console.log('Payload enviado: nenhum (GET sem token)');

            const res = await request(app).get('/tarefas');
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(401);
        });

    });

    // Agrupa os testes do endpoint PATCH /tarefas/:id
    describe('PATCH /tarefas/:id', () => {

        // Cenário de sucesso — atualizar tarefa com dados válidos
        it('deve atualizar uma tarefa com sucesso', async () => {
            const payload = {
                prioridade: 'baixa',
                descricao: 'Descrição atualizada'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .patch(`/tarefas/${tarefaId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(200);
            expect(res.body.prioridade).to.equal('baixa');
        });

        // Cenário de erro — atualizar com prazo no passado
        it('deve rejeitar atualização com prazo no passado', async () => {
            const payload = {
                prazo: '2020-01-01T10:00:00.000Z'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .patch(`/tarefas/${tarefaId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(400);
        });

        // Cenário de erro — atualizar sem autenticação
        it('deve rejeitar atualização sem autenticação', async () => {
            const payload = {
                prioridade: 'media'
            };
            console.log('Payload enviado:', payload);

            const res = await request(app)
                .patch(`/tarefas/${tarefaId}`)
                .send(payload);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(401);
        });

    });

    // Agrupa os testes do endpoint DELETE /tarefas/:id
    describe('DELETE /tarefas/:id', () => {

        // Cenário de erro — excluir sem autenticação
        it('deve rejeitar exclusão sem autenticação', async () => {
            console.log('Payload enviado: nenhum (DELETE sem token)');

            const res = await request(app)
                .delete(`/tarefas/${tarefaId}`);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(401);
        });

        // Cenário de erro — excluir tarefa que não existe
        it('deve rejeitar exclusão de tarefa inexistente', async () => {
            console.log('Payload enviado: nenhum (DELETE id inexistente)');

            const res = await request(app)
                .delete('/tarefas/id-que-nao-existe')
                .set('Authorization', `Bearer ${token}`);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(404);
        });

        // Cenário de sucesso — excluir tarefa com sucesso
        it('deve excluir uma tarefa com sucesso', async () => {
            console.log('Payload enviado: nenhum (DELETE)');

            const res = await request(app)
                .delete(`/tarefas/${tarefaId}`)
                .set('Authorization', `Bearer ${token}`);
            console.log('Status recebido:', res.status);
            console.log('Body recebido:', res.body);

            expect(res.status).to.equal(204);
        });

    });

}); // fecha o describe('Tarefas')