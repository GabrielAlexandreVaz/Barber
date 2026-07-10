'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiError');
const userRepository = require('../repositories/user.repository');

/**
 * Valida o access token no header Authorization e injeta `req.user`.
 * Rejeita com 401 se o token estiver ausente, inválido ou o usuário inativo.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Token de acesso não fornecido.');
  }

  const payload = verifyAccessToken(token);

  const user = await userRepository.findById(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Usuário inválido ou inativo.');
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
  };

  next();
});

module.exports = authenticate;
