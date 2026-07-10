'use strict';

const { body, param } = require('express-validator');
const { isImageRef } = require('./shared');

const idParamRules = [param('id').isUUID().withMessage('ID inválido.')];

// Campos de perfil do barbeiro comuns a criação/edição
const profileRules = [
  body('specialty').optional({ values: 'null' }).trim().isLength({ max: 120 }),
  body('bio').optional({ values: 'null' }).trim().isLength({ max: 1000 }),
  body('photoUrl').optional({ values: 'null' }).trim().custom(isImageRef).withMessage('Foto inválida.'),
  body('instagram').optional({ values: 'null' }).trim().isLength({ max: 60 }),
  body('socials').optional({ values: 'null' }).isObject().withMessage('socials deve ser um objeto.'),
  body('phone').optional({ values: 'null' }).trim().isLength({ min: 8, max: 20 }).withMessage('Telefone inválido.'),
];

const createRules = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório.').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('E-mail inválido.').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('A senha deve ter no mínimo 8 caracteres.')
    .matches(/[A-Za-z]/)
    .withMessage('A senha deve conter ao menos uma letra.')
    .matches(/\d/)
    .withMessage('A senha deve conter ao menos um número.'),
  ...profileRules,
];

const updateRules = [
  ...idParamRules,
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio.').isLength({ max: 120 }),
  ...profileRules,
];

const updateMeRules = [
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio.').isLength({ max: 120 }),
  ...profileRules,
];

const setStatusRules = [
  ...idParamRules,
  body('isActive').isBoolean().withMessage('isActive deve ser true ou false.').toBoolean(),
];

module.exports = {
  idParamRules,
  createRules,
  updateRules,
  updateMeRules,
  setStatusRules,
};
