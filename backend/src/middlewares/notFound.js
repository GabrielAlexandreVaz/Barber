'use strict';

const { ApiError } = require('../utils/apiError');

/**
 * Captura rotas inexistentes e delega ao error handler como 404.
 */
function notFound(req, res, next) {
  next(ApiError.notFound(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;
