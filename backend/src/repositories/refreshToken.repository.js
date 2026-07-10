'use strict';

const prisma = require('../config/prisma');

function create(data) {
  return prisma.refreshToken.create({ data });
}

function findByJti(jti) {
  return prisma.refreshToken.findUnique({ where: { jti } });
}

function revokeByJti(jti) {
  return prisma.refreshToken.updateMany({
    where: { jti, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

function revokeAllForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  create,
  findByJti,
  revokeByJti,
  revokeAllForUser,
};
