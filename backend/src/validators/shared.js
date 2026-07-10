'use strict';

const validator = require('validator');

/**
 * Aceita referência de imagem: vazio, URL http(s) completa ou caminho de
 * upload relativo ("/uploads/..."). Usado para photoUrl/imageUrl/avatarUrl,
 * que agora podem vir do upload local (Etapa 12).
 */
function isImageRef(value) {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string') return false;
  if (value.startsWith('/uploads/')) return true;
  return validator.isURL(value, { require_protocol: true });
}

module.exports = { isImageRef };
