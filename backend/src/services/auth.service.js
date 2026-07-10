'use strict';

const { ApiError } = require('../utils/apiError');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/jwt');

const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');

/**
 * Toda a regra de negócio de autenticação vive aqui. Controllers apenas
 * orquestram request/response; rotas apenas ligam validator -> controller.
 */

/** Remove campos sensíveis antes de devolver o usuário à camada HTTP. */
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role?.name,
  };
}

/** Emite access + refresh e persiste o refresh hasheado para revogação. */
async function issueTokens(user) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role.name });
  const { token: refreshToken, jti } = signRefreshToken({ sub: user.id });

  const decoded = verifyRefreshToken(refreshToken);
  await refreshTokenRepository.create({
    jti,
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: new Date(decoded.exp * 1000),
  });

  return { accessToken, refreshToken };
}

/**
 * Auto-cadastro de cliente.
 * @param {{ name, email, password, phone? }} input
 */
async function register(input) {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw ApiError.conflict('E-mail já cadastrado.');
  }

  const clientRole = await roleRepository.findByName('CLIENT');
  if (!clientRole) {
    throw ApiError.internal('Papel CLIENT não encontrado. Rode o seed do banco.');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await userRepository.createClientUser({
    name: input.name,
    email: input.email,
    passwordHash,
    phone: input.phone,
    roleId: clientRole.id,
  });

  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

/**
 * Login por email/senha.
 * @param {{ email, password }} input
 */
async function login(input) {
  const user = await userRepository.findByEmail(input.email);
  // Mensagem genérica para não revelar existência do e-mail
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Credenciais inválidas.');
  }

  const ok = await comparePassword(input.password, user.passwordHash);
  if (!ok) {
    throw ApiError.unauthorized('Credenciais inválidas.');
  }

  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

/**
 * Rotaciona o refresh token: valida, revoga o antigo e emite um novo par.
 * @param {string} refreshToken
 */
async function refresh(refreshToken) {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token não fornecido.');
  }

  const decoded = verifyRefreshToken(refreshToken); // lança se inválido/expirado

  const stored = await refreshTokenRepository.findByJti(decoded.jti);
  if (!stored || stored.revokedAt || stored.tokenHash !== hashToken(refreshToken)) {
    throw ApiError.unauthorized('Sessão inválida. Faça login novamente.');
  }

  const user = await userRepository.findById(decoded.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Usuário inválido.');
  }

  // Rotação: invalida o token usado e emite um novo par
  await refreshTokenRepository.revokeByJti(decoded.jti);
  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

/** Logout: revoga o refresh token informado (se válido). */
async function logout(refreshToken) {
  if (!refreshToken) return;
  try {
    const decoded = verifyRefreshToken(refreshToken);
    await refreshTokenRepository.revokeByJti(decoded.jti);
  } catch {
    // Token já inválido/expirado — nada a revogar
  }
}

/** Retorna o perfil público do usuário autenticado. */
async function me(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('Usuário não encontrado.');
  return toPublicUser(user);
}

module.exports = { register, login, refresh, logout, me };
