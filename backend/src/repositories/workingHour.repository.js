'use strict';

const prisma = require('../config/prisma');

function findByBarber(barberId) {
  return prisma.workingHour.findMany({
    where: { barberId },
    orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
  });
}

function findActiveByBarberAndWeekday(barberId, weekday) {
  return prisma.workingHour.findMany({
    where: { barberId, weekday, isActive: true },
    orderBy: { startTime: 'asc' },
  });
}

/**
 * Substitui toda a grade semanal do barbeiro numa transação (apaga e recria).
 * @param {string} barberId
 * @param {Array<{weekday, startTime, endTime}>} entries
 */
function replaceForBarber(barberId, entries) {
  return prisma.$transaction(async (tx) => {
    await tx.workingHour.deleteMany({ where: { barberId } });
    if (entries.length > 0) {
      await tx.workingHour.createMany({
        data: entries.map((e) => ({
          barberId,
          weekday: e.weekday,
          startTime: e.startTime,
          endTime: e.endTime,
        })),
      });
    }
    return tx.workingHour.findMany({
      where: { barberId },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    });
  });
}

module.exports = {
  findByBarber,
  findActiveByBarberAndWeekday,
  replaceForBarber,
};
