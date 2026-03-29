/** Valores aceitos pela API (português). */
const PRIORIDADES = Object.freeze(['baixa', 'média', 'alta']);
const STATUS = Object.freeze(['pendente', 'em andamento', 'concluída']);
const CATEGORIAS = Object.freeze(['trabalho', 'estudos', 'casa', 'pessoal', 'outro']);

const JWT_EXPIRES_IN = '8h';

module.exports = {
  PRIORIDADES,
  STATUS,
  CATEGORIAS,
  JWT_EXPIRES_IN,
};
