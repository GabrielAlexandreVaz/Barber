'use strict';

const morgan = require('morgan');
const env = require('./env');

/**
 * Middleware de log HTTP. Formato compacto ('dev') em desenvolvimento e
 * 'combined' em produção (mais detalhado, amigável a agregadores de log).
 */
const httpLogger = morgan(env.isProduction ? 'combined' : 'dev');

/**
 * Logger simples de aplicação. Mantido minimalista de propósito — pode ser
 * trocado por winston/pino no futuro sem alterar os call sites.
 */
const logger = {
  info: (...args) => console.log('[info]', ...args),
  warn: (...args) => console.warn('[warn]', ...args),
  error: (...args) => console.error('[error]', ...args),
};

module.exports = { httpLogger, logger };
