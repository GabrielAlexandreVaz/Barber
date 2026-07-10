'use strict';

const { query } = require('express-validator');

const rangeRules = [
  query('from').optional().isISO8601().withMessage('Data inicial inválida.'),
  query('to').optional().isISO8601().withMessage('Data final inválida.'),
];

module.exports = { rangeRules };
