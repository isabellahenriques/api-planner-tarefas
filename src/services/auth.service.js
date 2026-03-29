const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../model/memoryStore');
const { JWT_EXPIRES_IN } = require('../model/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'planner-dev-secret-change-in-production';

function login(email, senha) {
  if (!email || !senha) {
    const err = new Error('Email e senha são obrigatórios.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const usuario = store.usuarios.find((u) => u.email === String(email).trim().toLowerCase());
  if (!usuario || !bcrypt.compareSync(senha, usuario.senhaHash)) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  const token = jwt.sign(
    { sub: usuario.id, email: usuario.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  return {
    token,
    tipo: 'Bearer',
    expiraEm: JWT_EXPIRES_IN,
    usuario: { id: usuario.id, email: usuario.email },
  };
}

function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  login,
  verificarToken,
  JWT_SECRET,
};
