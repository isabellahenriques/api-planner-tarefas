const authService = require('../services/auth.service');

function extrairBearer(req) {
  const h = req.headers.authorization;
  if (!h || typeof h !== 'string') return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}

function authMiddleware(req, res, next) {
  const token = extrairBearer(req);
  if (!token) {
    return res.status(401).json({
      erro: 'Token de autenticação ausente ou inválido. Utilize o cabeçalho Authorization: Bearer <token>.',
      codigo: 'UNAUTHORIZED',
    });
  }
  try {
    const payload = authService.verificarToken(token);
    req.usuarioId = payload.sub;
    req.usuarioEmail = payload.email;
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({
        erro: 'O token de autenticação expirou. Faça login novamente.',
        codigo: 'TOKEN_EXPIRADO',
      });
    }
    return res.status(401).json({
      erro: 'Token de autenticação inválido.',
      codigo: 'UNAUTHORIZED',
    });
  }
}

module.exports = { authMiddleware, extrairBearer };
