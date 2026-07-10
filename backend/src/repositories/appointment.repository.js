'use strict';

const prisma = require('../config/prisma');
const { ApiError } = require('../utils/apiError');

// Status que efetivamente ocupam um horário (excluem cancelados/no-show)
const BLOCKING_STATUSES = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

// Relações carregadas para montar o DTO completo do agendamento
const fullInclude = {
  barber: { include: { user: { select: { name: true } } } },
  client: { include: { user: { select: { name: true } } } },
  services: { include: { service: { select: { name: true } } } },
  review: { select: { id: true, rating: true } },
};

/**
 * Agendamentos ativos de um barbeiro que se sobrepõem ao intervalo [from, to).
 * Usado no cálculo de disponibilidade (Etapa 7).
 */
function findBlockingByBarberAndRange(barberId, from, to) {
  return prisma.appointment.findMany({
    where: {
      barberId,
      status: { in: BLOCKING_STATUSES },
      startTime: { lt: to },
      endTime: { gt: from },
    },
    orderBy: { startTime: 'asc' },
  });
}

/**
 * Cria o agendamento + itens de serviço numa transação, re-checando conflito
 * de horário dentro da transação (trava contra reserva dupla).
 *
 * @param {{ appointmentData, serviceItems, barberId, startTime, endTime, excludeId? }} params
 */
function createWithConflictCheck({ appointmentData, serviceItems, barberId, startTime, endTime }) {
  return prisma.$transaction(async (tx) => {
    const conflicts = await tx.appointment.findMany({
      where: {
        barberId,
        status: { in: BLOCKING_STATUSES },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true },
    });
    if (conflicts.length > 0) {
      throw ApiError.conflict('Este horário acabou de ser reservado. Escolha outro.');
    }

    return tx.appointment.create({
      data: {
        ...appointmentData,
        services: { create: serviceItems },
      },
      include: fullInclude,
    });
  });
}

/** Re-agenda um agendamento existente, re-checando conflito (exclui a si mesmo). */
function rescheduleWithConflictCheck({ id, barberId, startTime, endTime }) {
  return prisma.$transaction(async (tx) => {
    const conflicts = await tx.appointment.findMany({
      where: {
        id: { not: id },
        barberId,
        status: { in: BLOCKING_STATUSES },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true },
    });
    if (conflicts.length > 0) {
      throw ApiError.conflict('Este horário não está mais disponível. Escolha outro.');
    }
    return tx.appointment.update({
      where: { id },
      data: { startTime, endTime },
      include: fullInclude,
    });
  });
}

function findMany(where, options = {}) {
  const { skip, take } = options;
  return prisma.appointment.findMany({
    where,
    include: fullInclude,
    orderBy: { startTime: 'desc' },
    ...(skip !== undefined ? { skip } : {}),
    ...(take !== undefined ? { take } : {}),
  });
}

function count(where) {
  return prisma.appointment.count({ where });
}

function findByIdFull(id) {
  return prisma.appointment.findUnique({ where: { id }, include: fullInclude });
}

function updateStatus(id, status) {
  return prisma.appointment.update({
    where: { id },
    data: { status },
    include: fullInclude,
  });
}

module.exports = {
  BLOCKING_STATUSES,
  findBlockingByBarberAndRange,
  createWithConflictCheck,
  rescheduleWithConflictCheck,
  findMany,
  count,
  findByIdFull,
  updateStatus,
};
