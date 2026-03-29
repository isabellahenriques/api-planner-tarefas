const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/** @type {Array<{ id: string, email: string, senhaHash: string, criadoEm: string }>} */
let usuarios = [];

/** @type {Array<{ id: string, usuarioId: string, titulo: string, descricao: string | null, prioridade: string, prazo: string, status: string, categoria: string | null, criadoEm: string, atualizadoEm: string }>} */
let tarefas = [];

function resetForTests() {
  usuarios = [];
  tarefas = [];
}

function seedUsuarioAdmin() {
  const existe = usuarios.some((u) => u.email === 'admin@planner.com');
  if (existe) return;
  const senhaHash = bcrypt.hashSync('admin123', 10);
  usuarios.push({
    id: crypto.randomUUID(),
    email: 'admin@planner.com',
    senhaHash,
    criadoEm: new Date().toISOString(),
  });
}

seedUsuarioAdmin();

module.exports = {
  get usuarios() {
    return usuarios;
  },
  set usuarios(v) {
    usuarios = v;
  },
  get tarefas() {
    return tarefas;
  },
  set tarefas(v) {
    tarefas = v;
  },
  resetForTests,
  seedUsuarioAdmin,
};
