'use strict';

const prisma = require('../config/prisma');

/**
 * Busca os agendamentos de um intervalo para agregação no dashboard.
 * Retorna apenas os campos necessários (leve).
 * @param {{ barberId?: string, from: Date, to: Date }} params
 */
function appointmentsInRange({ barberId, from, to }) {
  const where = { startTime: { gte: from, lt: to } };
  if (barberId) where.barberId = barberId;
  return prisma.appointment.findMany({
    where,
    select: {
      id: true,
      status: true,
      startTime: true,
      totalPrice: true,
      clientId: true,
    },
    orderBy: { startTime: 'asc' },
  });
}

module.exports = { appointmentsInRange };
