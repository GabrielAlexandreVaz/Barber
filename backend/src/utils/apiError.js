'use strict';

/**
 * Erro de aplicação com status HTTP e código semântico opcional.
 * Estilo funcional: uma factory que produz Error enriquecido, sem hierarquia
 * de classes de domínio.
 */
function createApiError(statusCode, message, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isApiError = true;
  if (code) error.code = code;
  return error;
}

const ApiError = {
  badRequest: (msg = 'Requisição inválida', code) => createApiError(400, msg, code),
  unauthorized: (msg = 'Não autenticado', code) => createApiError(401, msg, code),
  forbidden: (msg = 'Acesso negado', code) => createApiError(403, msg, code),
  notFound: (msg = 'Recurso não encontrado', code) => createApiError(404, msg, code),
  conflict: (msg = 'Conflito de dados', code) => createApiError(409, msg, code),
  unprocessable: (msg = 'Dados não processáveis', code) => createApiError(422, msg, code),
  internal: (msg = 'Erro interno do servidor', code) => createApiError(500, msg, code),
};

module.exports = { ApiError, createApiError };
