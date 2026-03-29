const userService = require('../services/user.service');

function criar(req, res, next) {
  try {
    const { email, senha } = req.body || {};
    const usuario = userService.criarUsuario({ email, senha });
    res.status(201).json(usuario);
  } catch (e) {
    next(e);
  }
}

module.exports = { criar };
