'use strict';

const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiError');

/**
 * Executa uma lista de validation chains do express-validator e, ao final,
 * agrega os erros. Uso: router.post('/', validate(rules), controller).
 *
 * @param {Array} validations chains do express-validator
 */
function validate(validations) {
  return async function runValidations(req, res, next) {
    await Promise.all(validations.map((v) => v.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const errors = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    const error = ApiError.unprocessable('Falha na validação dos dados.', 'VALIDATION_ERROR');
    error.details = errors;
    return next(error);
  };
}

module.exports = validate;
