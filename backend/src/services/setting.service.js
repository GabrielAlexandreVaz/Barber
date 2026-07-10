'use strict';

const { ApiError } = require('../utils/apiError');
const { isImageRef } = require('../validators/shared');
const settingRepository = require('../repositories/setting.repository');

// Chaves que o admin pode editar (whitelist — evita gravação arbitrária)
const ALLOWED_KEYS = new Set([
  'shop.name',
  'shop.phone',
  'shop.email',
  'shop.instagram',
  'shop.address',
  'shop.about',
  'shop.openingHours',
  'shop.logoUrl',
]);

const MAX_LEN = 2000;

/** Retorna todas as configurações como um mapa key -> value. */
async function getSettings() {
  const rows = await settingRepository.findAll();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/**
 * Atualiza as configurações a partir de um objeto { key: value }.
 * Ignora chaves fora da whitelist; valida os valores (strings).
 */
async function updateSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw ApiError.badRequest('Envie um objeto de configurações.');
  }

  const entries = Object.entries(input).filter(([key]) => ALLOWED_KEYS.has(key));
  if (entries.length === 0) {
    throw ApiError.badRequest('Nenhuma configuração válida informada.');
  }

  for (const [key, value] of entries) {
    if (value !== null && typeof value !== 'string') {
      throw ApiError.badRequest(`Valor inválido para ${key} (esperado texto).`);
    }
    if (typeof value === 'string' && value.length > MAX_LEN) {
      throw ApiError.badRequest(`Valor muito longo para ${key}.`);
    }
    if (key === 'shop.logoUrl' && !isImageRef(value)) {
      throw ApiError.badRequest('Logo inválido (envie uma imagem ou URL válida).');
    }
  }

  for (const [key, value] of entries) {
    await settingRepository.upsert(key, value ?? '');
  }

  return getSettings();
}

module.exports = { getSettings, updateSettings, ALLOWED_KEYS };
