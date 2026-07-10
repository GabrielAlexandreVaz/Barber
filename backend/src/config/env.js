'use strict';

const path = require('node:path');
const dotenv = require('dotenv');

// Carrega o .env da raiz do backend independentemente do cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Lê uma variável obrigatória. Lança erro na inicialização caso ausente,
 * evitando que o servidor suba com configuração inválida.
 */
function required(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function optional(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',
  port: Number(optional('PORT', 4000)),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:3000'),

  databaseUrl: required('DATABASE_URL'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: optional('JWT_ACCESS_EXPIRES', '15m'),
    refreshExpires: optional('JWT_REFRESH_EXPIRES', '7d'),
  },

  rateLimit: {
    windowMs: Number(optional('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000)),
    max: Number(optional('RATE_LIMIT_MAX', 300)),
    authMax: Number(optional('AUTH_RATE_LIMIT_MAX', 20)),
  },

  seed: {
    adminName: optional('SEED_ADMIN_NAME', 'Administrador'),
    adminEmail: optional('SEED_ADMIN_EMAIL', 'admin@theguetto.com'),
    adminPassword: optional('SEED_ADMIN_PASSWORD', 'Admin@123'),
  },
};

module.exports = env;
