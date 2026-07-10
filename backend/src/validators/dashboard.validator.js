'use strict';

const { query } = require('express-validator');

const overviewRules = [
  query('from').optional().isISO8601().withMessage('Data inicial inválida.'),
  query('to').optional().isISO8601().withMessage('Data final inválida.'),
  query('barberId').optional().isUUID().withMessage('Barbeiro inválido.'),
];

module.exports = { overviewRules };
