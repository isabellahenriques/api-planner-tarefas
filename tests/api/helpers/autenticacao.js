const request = require('supertest');
const app = require('../../../src/app');
const postLogin = require('../../fixtures/postLogin.json');

const obterToken = async () => {
    const res = await request(app)
        .post('/auth/login')
        .send(postLogin);

    return token = res.body.token;
}

module.exports = {
    obterToken
}