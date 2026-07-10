'use strict';

const { Prisma } = require('@prisma/client');
const { MulterError } = require('multer');
const env = require('../config/env');
const { logger } = require('../config/logger');

/**
 * Handler central de erros. Normaliza ApiError, erros conhecidos do Prisma e
 * qualquer exceção inesperada num formato JSON consistente.
 */
// eslint-disable-next-line no-unused-vars -- assinatura de 4 args exigida pelo Express
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  let code = err.code;

  // Violação de restrição única do Prisma (ex.: email já cadastrado)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(', ')
        : 'campo';
      message = `Já existe um registro com este valor (${target}).`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Registro não encontrado.';
    }
    code = err.code;
  }

  // Erros de JWT inválido/expirado
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token inválido ou expirado.';
  }

  // Erros do Multer (upload)
  if (err instanceof MulterError) {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Arquivo muito grande (máximo 5MB).'
        : 'Falha no envio do arquivo.';
  }

  if (statusCode >= 500) {
    logger.error(err);
  }

  const body = { success: false, message, code };
  if (err.details) body.details = err.details;
  if (!env.isProduction && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
