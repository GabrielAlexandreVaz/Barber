'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const jsonMessage = (message) => ({ success: false, message });

/**
 * Limite global aplicado a toda a API.
 */
const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Muitas requisições. Tente novamente em instantes.'),
});

/**
 * Limite mais rígido para rotas sensíveis de autenticação (anti brute-force).
 */
const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Muitas tentativas de autenticação. Aguarde e tente novamente.'),
});

module.exports = { globalLimiter, authLimiter };
