const crypto = require('crypto');
const store = require('../model/memoryStore');
const { PRIORIDADES, STATUS, CATEGORIAS } = require('../model/constants');

function tituloChave(titulo) {
  return String(titulo || '').trim().toLowerCase();
}

function prazoNoPassado(prazoIso) {
  const d = new Date(prazoIso);
  if (Number.isNaN(d.getTime())) return true;
  return d.getTime() < Date.now();
}

function validarPrioridade(p) {
  return PRIORIDADES.includes(p);
}

function validarStatus(s) {
  return STATUS.includes(s);
}

function validarCategoria(c) {
  if (c === null || c === undefined || c === '') return true;
  return CATEGORIAS.includes(c);
}

function tituloDuplicado(usuarioId, titulo, excetoId = null) {
  const chave = tituloChave(titulo);
  return store.tarefas.some(
    (t) =>
      t.usuarioId === usuarioId &&
      tituloChave(t.titulo) === chave &&
      (excetoId === null || t.id !== excetoId)
  );
}

function listarPorUsuario(usuarioId) {
  return store.tarefas
    .filter((t) => t.usuarioId === usuarioId)
    .sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm))
    .map(serializar);
}

function obterPorId(usuarioId, tarefaId) {
  const t = store.tarefas.find((x) => x.id === tarefaId && x.usuarioId === usuarioId);
  return t ? serializar(t) : null;
}

function criar(usuarioId, body) {
  const titulo = body.titulo;
  if (titulo === undefined || titulo === null || String(titulo).trim() === '') {
    const err = new Error('O título é obrigatório.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (tituloDuplicado(usuarioId, titulo)) {
    const err = new Error('Já existe uma tarefa com este título.');
    err.status = 409;
    err.code = 'CONFLICT';
    throw err;
  }
  const prioridade = body.prioridade;
  if (!prioridade || !validarPrioridade(prioridade)) {
    const err = new Error(
      `A prioridade é obrigatória e deve ser uma destas: ${PRIORIDADES.join(', ')}.`
    );
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (body.prazo === undefined || body.prazo === null || body.prazo === '') {
    const err = new Error('O prazo é obrigatório.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (prazoNoPassado(body.prazo)) {
    const err = new Error('O prazo não pode ser uma data ou hora no passado.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  let categoria = body.categoria;
  if (categoria === undefined || categoria === null || categoria === '') {
    categoria = null;
  } else if (!validarCategoria(categoria)) {
    const err = new Error(
      `Se informada, a categoria deve ser uma destas: ${CATEGORIAS.join(', ')}.`
    );
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const agora = new Date().toISOString();
  const nova = {
    id: crypto.randomUUID(),
    usuarioId,
    titulo: String(titulo).trim(),
    descricao:
      body.descricao === undefined || body.descricao === null || body.descricao === ''
        ? null
        : String(body.descricao),
    prioridade,
    prazo: typeof body.prazo === 'string' ? body.prazo : new Date(body.prazo).toISOString(),
    status: 'pendente',
    categoria,
    criadoEm: agora,
    atualizadoEm: agora,
  };
  store.tarefas.push(nova);
  return serializar(nova);
}

const CAMPOS_PATCH = ['titulo', 'descricao', 'prioridade', 'prazo', 'status', 'categoria'];

function atualizarParcial(usuarioId, tarefaId, body) {
  const idx = store.tarefas.findIndex((x) => x.id === tarefaId && x.usuarioId === usuarioId);
  if (idx === -1) return null;
  const temAlgum = CAMPOS_PATCH.some((c) => Object.prototype.hasOwnProperty.call(body, c));
  if (!temAlgum) {
    const err = new Error('Envie ao menos um dos campos permitidos para atualização.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const t = { ...store.tarefas[idx] };

  if (Object.prototype.hasOwnProperty.call(body, 'titulo')) {
    const titulo = body.titulo;
    if (titulo === null || String(titulo).trim() === '') {
      const err = new Error('O título não pode ser vazio.');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    if (tituloDuplicado(usuarioId, titulo, tarefaId)) {
      const err = new Error('Já existe uma tarefa com este título.');
      err.status = 409;
      err.code = 'CONFLICT';
      throw err;
    }
    t.titulo = String(titulo).trim();
  }
  if (Object.prototype.hasOwnProperty.call(body, 'descricao')) {
    const d = body.descricao;
    t.descricao = d === null || d === undefined || d === '' ? null : String(d);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'prioridade')) {
    if (!validarPrioridade(body.prioridade)) {
      const err = new Error(`A prioridade deve ser uma destas: ${PRIORIDADES.join(', ')}.`);
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    t.prioridade = body.prioridade;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'prazo')) {
    if (body.prazo === null || body.prazo === '') {
      const err = new Error('O prazo não pode ser removido; informe uma data válida.');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    if (prazoNoPassado(body.prazo)) {
      const err = new Error('O prazo não pode ser uma data ou hora no passado.');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    t.prazo = typeof body.prazo === 'string' ? body.prazo : new Date(body.prazo).toISOString();
  }
  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    if (!validarStatus(body.status)) {
      const err = new Error(`O status deve ser um destes: ${STATUS.join(', ')}.`);
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    t.status = body.status;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'categoria')) {
    const c = body.categoria;
    if (c === null || c === undefined || c === '') {
      t.categoria = null;
    } else if (!validarCategoria(c)) {
      const err = new Error(
        `Se informada, a categoria deve ser uma destas: ${CATEGORIAS.join(', ')}.`
      );
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    } else {
      t.categoria = c;
    }
  }

  t.atualizadoEm = new Date().toISOString();
  store.tarefas[idx] = t;
  return serializar(t);
}

function remover(usuarioId, tarefaId) {
  const idx = store.tarefas.findIndex((x) => x.id === tarefaId && x.usuarioId === usuarioId);
  if (idx === -1) return false;
  store.tarefas.splice(idx, 1);
  return true;
}

function serializar(t) {
  return {
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao,
    prioridade: t.prioridade,
    prazo: t.prazo,
    status: t.status,
    categoria: t.categoria,
    criadoEm: t.criadoEm,
    atualizadoEm: t.atualizadoEm,
  };
}

module.exports = {
  listarPorUsuario,
  obterPorId,
  criar,
  atualizarParcial,
  remover,
};
