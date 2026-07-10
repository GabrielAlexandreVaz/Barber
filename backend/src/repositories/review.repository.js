'use strict';

const prisma = require('../config/prisma');

function create(data) {
  return prisma.review.create({ data });
}

function findByAppointmentId(appointmentId) {
  return prisma.review.findUnique({ where: { appointmentId } });
}

/** Avaliações de um barbeiro, com o nome do cliente. */
function findByBarber(barberId) {
  return prisma.review.findMany({
    where: { barberId },
    orderBy: { createdAt: 'desc' },
    include: { client: { include: { user: { select: { name: true } } } } },
  });
}

/** Média e contagem de avaliações de um barbeiro. */
function aggregateByBarber(barberId) {
  return prisma.review.aggregate({
    where: { barberId },
    _avg: { rating: true },
    _count: { _all: true },
  });
}

/** Média e contagem agrupadas para vários barbeiros (para listagens). */
function groupByBarbers(barberIds) {
  return prisma.review.groupBy({
    by: ['barberId'],
    where: { barberId: { in: barberIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
}

module.exports = {
  create,
  findByAppointmentId,
  findByBarber,
  aggregateByBarber,
  groupByBarbers,
};
