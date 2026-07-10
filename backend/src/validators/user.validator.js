'use strict';

const { body, param, query } = require('express-validator');
const { isImageRef } = require('./shared');

const ROLES = ['CLIENT', 'BARBER', 'ADMIN'];

const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio.').isLength({ max: 120 }),
  body('phone').optional({ values: 'null' }).trim().isLength({ min: 8, max: 20 }).withMessage('Telefone inválido.'),
  body('avatarUrl').optional({ values: 'null' }).trim().custom(isImageRef).withMessage('Avatar inválido.'),
];

const changePasswordRules = [
  body('currentPassword').isString().notEmpty().withMessage('Informe a senha atual.'),
  body('newPassword')
    .isString()
    .isLength({ min: 8 })
    .withMessage('A nova senha deve ter no mínimo 8 caracteres.')
    .matches(/[A-Za-z]/)
    .withMessage('A senha deve conter ao menos uma letra.')
    .matches(/\d/)
    .withMessage('A senha deve conter ao menos um número.'),
];

const listRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim(),
  query('role').optional().isIn(ROLES).withMessage('Papel inválido.'),
  query('active').optional().isBoolean().withMessage('active deve ser true ou false.'),
];

const idParamRules = [param('id').isUUID().withMessage('ID inválido.')];

const adminUpdateRules = [
  ...idParamRules,
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('phone').optional({ values: 'null' }).trim().isLength({ min: 8, max: 20 }),
  body('avatarUrl').optional({ values: 'null' }).trim().custom(isImageRef).withMessage('Avatar inválido.'),
  body('role').optional().isIn(ROLES).withMessage('Papel inválido.'),
];

const setStatusRules = [
  ...idParamRules,
  body('isActive').isBoolean().withMessage('isActive deve ser true ou false.').toBoolean(),
];

module.exports = {
  updateProfileRules,
  changePasswordRules,
  listRules,
  idParamRules,
  adminUpdateRules,
  setStatusRules,
};
