'use strict';

const prisma = require('../config/prisma');

/** Contagem de agendamentos por status no período. */
function statusCounts({ from, to }) {
  return prisma.appointment.groupBy({
    by: ['status'],
    where: { startTime: { gte: from, lt: to } },
    _count: { _all: true },
  });
}

/** Faturamento e nº de atendimentos concluídos por barbeiro. */
function revenueByBarber({ from, to }) {
  return prisma.appointment.groupBy({
    by: ['barberId'],
    where: { status: 'COMPLETED', startTime: { gte: from, lt: to } },
    _sum: { totalPrice: true },
    _count: { _all: true },
  });
}

/** Serviços mais vendidos (em atendimentos concluídos no período). */
function topServices({ from, to }) {
  return prisma.appointmentService.groupBy({
    by: ['serviceId'],
    where: { appointment: { is: { status: 'COMPLETED', startTime: { gte: from, lt: to } } } },
    _sum: { priceAtBooking: true },
    _count: { _all: true },
  });
}

function barberNames(ids) {
  return prisma.barber.findMany({
    where: { id: { in: ids } },
    select: { id: true, user: { select: { name: true } } },
  });
}

function serviceNames(ids) {
  return prisma.service.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
}

/** Atendimentos do período para exportação (com relações necessárias). */
function appointmentsForExport({ from, to }) {
  return prisma.appointment.findMany({
    where: { startTime: { gte: from, lt: to } },
    orderBy: { startTime: 'asc' },
    include: {
      barber: { include: { user: { select: { name: true } } } },
      client: { include: { user: { select: { name: true } } } },
      services: { include: { service: { select: { name: true } } } },
    },
  });
}

module.exports = {
  statusCounts,
  revenueByBarber,
  topServices,
  barberNames,
  serviceNames,
  appointmentsForExport,
};
