const request = require('supertest'); // Importa o supertest para fazer requisições HTTP à API
const { expect } = require('chai'); // Importa o expect do chai para fazer as asserções (verificações)
const app = require('../../src/app'); // Importa o app para que o supertest consiga fazer as requisições

// Token JWT gerado no before para ser usado nos testes autenticados
let token;

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

});