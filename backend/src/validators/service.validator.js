'use strict';

const { body, param } = require('express-validator');
const { isImageRef } = require('./shared');

const idParamRules = [param('id').isUUID().withMessage('ID inválido.')];

const createRules = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório.').isLength({ max: 120 }),
  body('price')
    .notEmpty()
    .withMessage('Preço é obrigatório.')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número maior ou igual a zero.')
    .toFloat(),
  body('durationMinutes')
    .notEmpty()
    .withMessage('Duração é obrigatória.')
    .isInt({ min: 1, max: 600 })
    .withMessage('Duração deve ser entre 1 e 600 minutos.')
    .toInt(),
  body('category').optional({ values: 'null' }).trim().isLength({ max: 60 }),
  body('description').optional({ values: 'null' }).trim().isLength({ max: 1000 }),
  body('imageUrl').optional({ values: 'null' }).trim().custom(isImageRef).withMessage('Imagem inválida.'),
];

const updateRules = [
  ...idParamRules,
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio.').isLength({ max: 120 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Preço inválido.').toFloat(),
  body('durationMinutes').optional().isInt({ min: 1, max: 600 }).withMessage('Duração inválida.').toInt(),
  body('category').optional({ values: 'null' }).trim().isLength({ max: 60 }),
  body('description').optional({ values: 'null' }).trim().isLength({ max: 1000 }),
  body('imageUrl').optional({ values: 'null' }).trim().custom(isImageRef).withMessage('Imagem inválida.'),
];

const setStatusRules = [
  ...idParamRules,
  body('isActive').isBoolean().withMessage('isActive deve ser true ou false.').toBoolean(),
];

module.exports = { idParamRules, createRules, updateRules, setStatusRules };
