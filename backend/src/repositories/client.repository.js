'use strict';

const prisma = require('../config/prisma');

function findByUserId(userId) {
  return prisma.client.findUnique({ where: { userId } });
}

function findById(id) {
  return prisma.client.findUnique({ where: { id } });
}

module.exports = { findByUserId, findById };
