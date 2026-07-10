'use strict';

const { body } = require('express-validator');

// Senha forte: mínimo 8 caracteres, ao menos 1 letra e 1 número
const strongPassword = body('password')
  .isString()
  .isLength({ min: 8 })
  .withMessage('A senha deve ter no mínimo 8 caracteres.')
  .matches(/[A-Za-z]/)
  .withMessage('A senha deve conter ao menos uma letra.')
  .matches(/\d/)
  .withMessage('A senha deve conter ao menos um número.');

const registerRules = [
  // Sem .escape(): a saída é escapada pelo React; escapar na entrada gravaria
  // entidades HTML no banco (ex.: nomes com apóstrofo ficariam quebrados).
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório.')
    .isLength({ max: 120 }),
  body('email')
    .trim()
    .isEmail()
    .withMessage('E-mail inválido.')
    .normalizeEmail(),
  strongPassword,
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Telefone inválido.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('E-mail inválido.').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Senha é obrigatória.'),
];

const refreshRules = [
  body('refreshToken').isString().notEmpty().withMessage('Refresh token é obrigatório.'),
];

module.exports = { registerRules, loginRules, refreshRules };
