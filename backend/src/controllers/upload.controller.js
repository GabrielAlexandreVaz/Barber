'use strict';

const { ApiError } = require('../utils/apiError');

/**
 * Retorna o caminho público do arquivo enviado. O caminho é relativo
 * (`/uploads/...`); o frontend compõe a URL completa com a origem da API.
 */
function uploadImage(req, res, next) {
  if (!req.file) {
    return next(ApiError.badRequest('Nenhum arquivo enviado (campo "file").'));
  }
  return res.status(201).json({
    success: true,
    data: {
      path: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
}

module.exports = { uploadImage };
