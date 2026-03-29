const taskService = require('../services/task.service');

function listar(req, res, next) {
  try {
    const lista = taskService.listarPorUsuario(req.usuarioId);
    res.status(200).json(lista);
  } catch (e) {
    next(e);
  }
}

function obter(req, res, next) {
  try {
    const t = taskService.obterPorId(req.usuarioId, req.params.id);
    if (!t) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada ou você não tem permissão para acessá-la.',
        codigo: 'NAO_ENCONTRADO',
      });
    }
    res.status(200).json(t);
  } catch (e) {
    next(e);
  }
}

function criar(req, res, next) {
  try {
    const t = taskService.criar(req.usuarioId, req.body || {});
    res.status(201).json(t);
  } catch (e) {
    next(e);
  }
}

function patch(req, res, next) {
  try {
    const t = taskService.atualizarParcial(req.usuarioId, req.params.id, req.body || {});
    if (!t) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada ou você não tem permissão para alterá-la.',
        codigo: 'NAO_ENCONTRADO',
      });
    }
    res.status(200).json(t);
  } catch (e) {
    next(e);
  }
}

function remover(req, res, next) {
  try {
    const ok = taskService.remover(req.usuarioId, req.params.id);
    if (!ok) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada ou você não tem permissão para excluí-la.',
        codigo: 'NAO_ENCONTRADO',
      });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listar,
  obter,
  criar,
  patch,
  remover,
};
