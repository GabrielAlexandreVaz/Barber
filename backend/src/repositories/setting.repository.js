'use strict';

const prisma = require('../config/prisma');

function findAll() {
  return prisma.setting.findMany();
}

function upsert(key, value) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

module.exports = { findAll, upsert };
