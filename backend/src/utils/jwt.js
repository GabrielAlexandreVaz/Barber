'use strict';

const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Assina um access token de curta duração.
 * @param {{ sub: string, role: string }} payload
 */
function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
}

/**
 * Assina um refresh token de longa duração. Inclui um `jti` aleatório para
 * permitir rotação/revogação individual do token.
 * @param {{ sub: string }} payload
 */
function signRefreshToken(payload) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ ...payload, jti }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });
  return { token, jti };
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

/**
 * Hash SHA-256 do refresh token para armazenamento no banco — nunca guardamos
 * o token em texto puro, apenas o digest para conferência.
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
