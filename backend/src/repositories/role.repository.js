'use strict';

const prisma = require('../config/prisma');

function findByName(name) {
  return prisma.role.findUnique({ where: { name } });
}

module.exports = { findByName };
