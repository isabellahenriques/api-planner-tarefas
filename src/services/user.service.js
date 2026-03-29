const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const store = require('../model/memoryStore');

function criarUsuario({ email, senha }) {
  const emailNorm = String(email || '').trim().toLowerCase();
  if (!emailNorm) {
    const err = new Error('O email é obrigatório.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (!senha || String(senha).length < 4) {
    const err = new Error('A senha é obrigatória e deve ter pelo menos 4 caracteres.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const duplicado = store.usuarios.some((u) => u.email === emailNorm);
  if (duplicado) {
    const err = new Error('Já existe um usuário cadastrado com este email.');
    err.status = 409;
    err.code = 'CONFLICT';
    throw err;
  }
  const agora = new Date().toISOString();
  const novo = {
    id: crypto.randomUUID(),
    email: emailNorm,
    senhaHash: bcrypt.hashSync(String(senha), 10),
    criadoEm: agora,
  };
  store.usuarios.push(novo);
  return {
    id: novo.id,
    email: novo.email,
    criadoEm: novo.criadoEm,
  };
}

module.exports = { criarUsuario };
