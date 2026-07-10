'use strict';

const { body, param, query } = require('express-validator');

const STATUSES = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

const idParamRules = [param('id').isUUID().withMessage('ID inválido.')];

const createRules = [
  body('barberId').isUUID().withMessage('Barbeiro inválido.'),
  body('serviceIds')
    .isArray({ min: 1 })
    .withMessage('Selecione ao menos um serviço.'),
  body('serviceIds.*').isUUID().withMessage('Serviço inválido.'),
  body('startTime').isISO8601().withMessage('Horário inválido.'),
  body('notes').optional({ values: 'null' }).trim().isLength({ max: 500 }),
  body('clientId').optional().isUUID().withMessage('Cliente inválido.'),
];

const listRules = [
  query('status').optional().isIn(STATUSES).withMessage('Status inválido.'),
  query('from').optional().isISO8601().withMessage('Data inicial inválida.'),
  query('to').optional().isISO8601().withMessage('Data final inválida.'),
  query('barberId').optional().isUUID(),
  query('clientId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const setStatusRules = [
  ...idParamRules,
  body('status').isIn(STATUSES).withMessage('Status inválido.'),
];

const rescheduleRules = [
  ...idParamRules,
  body('startTime').isISO8601().withMessage('Horário inválido.'),
];

module.exports = {
  idParamRules,
  createRules,
  listRules,
  setStatusRules,
  rescheduleRules,
};
