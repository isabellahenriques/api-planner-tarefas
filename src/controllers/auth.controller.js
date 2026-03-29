const authService = require('../services/auth.service');

function login(req, res, next) {
  try {
    const { email, senha } = req.body || {};
    const resultado = authService.login(email, senha);
    res.status(200).json(resultado);
  } catch (e) {
    next(e);
  }
}

module.exports = { login };
