'use strict';

const { ApiError } = require('../utils/apiError');

/**
 * Guarda de autorização por papel (RBAC). Deve ser usado após `authenticate`.
 * Uso: router.get('/admin', authenticate, authorize('ADMIN'), handler)
 *
 * @param {...string} allowedRoles papéis permitidos
 */
function authorize(...allowedRoles) {
  return function guard(req, res, next) {
    if (!req.user) {
      return next(ApiError.unauthorized('Não autenticado.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('Você não tem permissão para acessar este recurso.'));
    }
    return next();
  };
}

module.exports = authorize;
