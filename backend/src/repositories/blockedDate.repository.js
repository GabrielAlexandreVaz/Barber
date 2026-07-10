'use strict';

const prisma = require('../config/prisma');

/** Bloqueios que se sobrepõem ao intervalo [from, to). */
function findByBarberAndRange(barberId, from, to) {
  return prisma.blockedDate.findMany({
    where: {
      barberId,
      startAt: { lt: to },
      endAt: { gt: from },
    },
    orderBy: { startAt: 'asc' },
  });
}

function create(data) {
  return prisma.blockedDate.create({ data });
}

function findById(id) {
  return prisma.blockedDate.findUnique({ where: { id } });
}

function remove(id) {
  return prisma.blockedDate.delete({ where: { id } });
}

module.exports = {
  findByBarberAndRange,
  create,
  findById,
  remove,
};
