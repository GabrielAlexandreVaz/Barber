'use strict';

const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const { logger } = require('./config/logger');

async function start() {
  try {
    // Falha rápido se o banco não estiver acessível
    await prisma.$connect();
    logger.info('Conexão com o PostgreSQL estabelecida.');

    const server = app.listen(env.port, () => {
      logger.info(`API The Guetto rodando em http://localhost:${env.port} [${env.nodeEnv}]`);
    });

    const shutdown = async (signal) => {
      logger.info(`Recebido ${signal}, encerrando...`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error('Falha ao iniciar o servidor:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
