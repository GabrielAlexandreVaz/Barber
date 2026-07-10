'use strict';

const prisma = require('../config/prisma');

/**
 * Acesso ao agregado Service (catálogo de serviços da barbearia).
 */

function findMany({ includeInactive }) {
  const where = includeInactive ? {} : { isActive: true };
  return prisma.service.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

function findById(id) {
  return prisma.service.findUnique({ where: { id } });
}

function findByIds(ids) {
  return prisma.service.findMany({ where: { id: { in: ids } } });
}

function create(data) {
  return prisma.service.create({ data });
}

function update(id, data) {
  return prisma.service.update({ where: { id }, data });
}

function setActive(id, isActive) {
  return prisma.service.update({ where: { id }, data: { isActive } });
}

function remove(id) {
  return prisma.service.delete({ where: { id } });
}

/** Conta quantos agendamentos referenciam este serviço (para decidir dele­ção). */
function countAppointmentRefs(id) {
  return prisma.appointmentService.count({ where: { serviceId: id } });
}

module.exports = {
  findMany,
  findById,
  findByIds,
  create,
  update,
  setActive,
  remove,
  countAppointmentRefs,
};
