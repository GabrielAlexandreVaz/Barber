'use strict';

const { body, param, query } = require('express-validator');

const barberIdParam = [param('barberId').isUUID().withMessage('ID de barbeiro inválido.')];

// A validação fina das entradas (formato HH:MM, sobreposição) é feita no service
const setWorkingHoursRules = [
  ...barberIdParam,
  body('entries').isArray().withMessage('entries deve ser uma lista.'),
];

const createBlockedRules = [
  ...barberIdParam,
  body('startAt').isISO8601().withMessage('startAt deve ser uma data/hora válida.'),
  body('endAt').isISO8601().withMessage('endAt deve ser uma data/hora válida.'),
  body('reason').optional({ values: 'null' }).trim().isLength({ max: 200 }),
];

const deleteBlockedRules = [
  ...barberIdParam,
  param('blockedId').isUUID().withMessage('ID de bloqueio inválido.'),
];

const availabilityRules = [
  ...barberIdParam,
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date deve estar no formato YYYY-MM-DD.'),
  query('duration').optional().isInt({ min: 1, max: 600 }).withMessage('duration inválida.'),
  query('step').optional().isInt({ min: 5, max: 120 }).withMessage('step inválido.'),
];

module.exports = {
  barberIdParam,
  setWorkingHoursRules,
  createBlockedRules,
  deleteBlockedRules,
  availabilityRules,
};
