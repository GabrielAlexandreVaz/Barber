'use strict';

/**
 * Envolve um handler async e encaminha qualquer rejeição ao next(),
 * evitando try/catch repetitivo em todos os controllers.
 *
 * @param {Function} fn (req, res, next) => Promise
 * @returns {Function} handler Express seguro
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
