'use strict';

const { PrismaClient } = require('@prisma/client');
const env = require('./env');

/**
 * Singleton do PrismaClient. Em desenvolvimento o `node --watch` recarrega o
 * módulo; guardar a instância no globalThis evita esgotar o pool de conexões.
 */
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: env.isProduction ? ['error'] : ['warn', 'error'],
  });

if (!env.isProduction) {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
