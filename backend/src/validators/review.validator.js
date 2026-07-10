'use strict';

const { body, param } = require('express-validator');

const createReviewRules = [
  param('id').isUUID().withMessage('Agendamento inválido.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('A nota deve ser de 1 a 5.').toInt(),
  body('comment').optional({ values: 'null' }).trim().isLength({ max: 500 }),
];

module.exports = { createReviewRules };
