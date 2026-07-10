'use strict';

const { ApiError } = require('../utils/apiError');
const appointmentRepository = require('../repositories/appointment.repository');
const clientRepository = require('../repositories/client.repository');
const barberRepository = require('../repositories/barber.repository');
const serviceRepository = require('../repositories/service.repository');
const scheduleService = require('./schedule.service');

const CLIENT_CANCELABLE = ['SCHEDULED', 'CONFIRMED'];
const RESCHEDULABLE = ['SCHEDULED', 'CONFIRMED'];
const STAFF_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];

/** Monta o DTO do agendamento (achata relações, converte Decimais). */
function toAppointmentDTO(a) {
  if (!a) return null;
  return {
    id: a.id,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    status: a.status,
    notes: a.notes,
    totalPrice: Number(a.totalPrice),
    totalDuration: a.totalDuration,
    barber: { id: a.barberId, name: a.barber.user.name },
    client: { id: a.clientId, name: a.client.user.name },
    services: a.services.map((as) => ({
      id: as.serviceId,
      name: as.service.name,
      price: Number(as.priceAtBooking),
      durationMinutes: as.durationAtBooking,
    })),
    review: a.review ? { id: a.review.id, rating: a.review.rating } : null,
    createdAt: a.createdAt,
  };
}

/** Resolve o clientId conforme o solicitante (cliente = próprio; admin informa). */
async function resolveClientId(input, requester) {
  if (requester.role === 'CLIENT') {
    const client = await clientRepository.findByUserId(requester.id);
    if (!client) throw ApiError.badRequest('Perfil de cliente não encontrado.');
    return client.id;
  }
  if (requester.role === 'ADMIN') {
    if (!input.clientId) throw ApiError.badRequest('Informe o cliente (clientId).');
    const client = await clientRepository.findById(input.clientId);
    if (!client) throw ApiError.notFound('Cliente não encontrado.');
    return client.id;
  }
  throw ApiError.forbidden('Apenas clientes ou administradores podem criar agendamentos.');
}

async function createAppointment(input, requester) {
  const clientId = await resolveClientId(input, requester);

  // Serviços (remove duplicados, valida existência e disponibilidade)
  const serviceIds = [...new Set(input.serviceIds || [])];
  if (serviceIds.length === 0) throw ApiError.badRequest('Selecione ao menos um serviço.');

  const services = await serviceRepository.findByIds(serviceIds);
  if (services.length !== serviceIds.length) {
    throw ApiError.badRequest('Um ou mais serviços não foram encontrados.');
  }
  const inactive = services.find((s) => !s.isActive);
  if (inactive) throw ApiError.badRequest(`Serviço indisponível: ${inactive.name}.`);

  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);
  const serviceItems = services.map((s) => ({
    serviceId: s.id,
    priceAtBooking: s.price,
    durationAtBooking: s.durationMinutes,
  }));

  // Barbeiro
  const barber = await barberRepository.findById(input.barberId);
  if (!barber || !barber.isActive || !barber.user.isActive) {
    throw ApiError.badRequest('Barbeiro indisponível.');
  }

  // Horário
  const startTime = new Date(input.startTime);
  if (Number.isNaN(startTime.getTime())) throw ApiError.badRequest('Horário inválido.');
  if (startTime.getTime() < Date.now()) throw ApiError.badRequest('Não é possível agendar no passado.');
  const endTime = new Date(startTime.getTime() + totalDuration * 60_000);

  // Expediente + bloqueios (conflito com outros agendamentos é checado na transação)
  await scheduleService.assertBookable(input.barberId, startTime, endTime);

  const created = await appointmentRepository.createWithConflictCheck({
    appointmentData: {
      clientId,
      barberId: input.barberId,
      startTime,
      endTime,
      status: 'SCHEDULED',
      notes: input.notes || null,
      totalPrice,
      totalDuration,
    },
    serviceItems,
    barberId: input.barberId,
    startTime,
    endTime,
  });

  return toAppointmentDTO(created);
}

/**
 * Lista agendamentos com escopo por papel e filtros.
 * Se `page`/`limit` vierem, retorna paginado ({ items, pagination });
 * caso contrário, retorna todos ({ items, pagination: null }) — mantém o
 * comportamento do painel de agendamentos.
 */
async function listAppointments(requester, filters = {}) {
  const where = {};

  if (requester.role === 'CLIENT') {
    const client = await clientRepository.findByUserId(requester.id);
    if (!client) return { items: [], pagination: null };
    where.clientId = client.id;
  } else if (requester.role === 'BARBER') {
    const barber = await barberRepository.findByUserId(requester.id);
    if (!barber) return { items: [], pagination: null };
    where.barberId = barber.id;
  } else {
    if (filters.barberId) where.barberId = filters.barberId;
    if (filters.clientId) where.clientId = filters.clientId;
  }

  if (filters.status) where.status = filters.status;
  if (filters.from || filters.to) {
    where.startTime = {};
    if (filters.from) where.startTime.gte = new Date(filters.from);
    if (filters.to) where.startTime.lte = new Date(filters.to);
  }

  const paginate = filters.page !== undefined || filters.limit !== undefined;
  if (!paginate) {
    const items = await appointmentRepository.findMany(where);
    return { items: items.map(toAppointmentDTO), pagination: null };
  }

  const take = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
  const page = Math.max(Number(filters.page) || 1, 1);
  const skip = (page - 1) * take;

  const [items, total] = await Promise.all([
    appointmentRepository.findMany(where, { skip, take }),
    appointmentRepository.count(where),
  ]);

  return {
    items: items.map(toAppointmentDTO),
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) || 1 },
  };
}

/** Garante que o solicitante pode ver/gerenciar o agendamento. */
function assertCanView(appt, requester) {
  if (requester.role === 'ADMIN') return;
  if (requester.id === appt.client.userId) return;
  if (requester.id === appt.barber.userId) return;
  throw ApiError.forbidden('Você não tem acesso a este agendamento.');
}

async function getAppointment(id, requester) {
  const appt = await appointmentRepository.findByIdFull(id);
  if (!appt) throw ApiError.notFound('Agendamento não encontrado.');
  assertCanView(appt, requester);
  return toAppointmentDTO(appt);
}

async function cancelAppointment(id, requester) {
  const appt = await appointmentRepository.findByIdFull(id);
  if (!appt) throw ApiError.notFound('Agendamento não encontrado.');
  assertCanView(appt, requester);

  if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appt.status)) {
    throw ApiError.badRequest('Este agendamento não pode mais ser cancelado.');
  }
  // Cliente só cancela se ainda estiver agendado/confirmado
  const isClient = requester.role === 'CLIENT';
  if (isClient && !CLIENT_CANCELABLE.includes(appt.status)) {
    throw ApiError.badRequest('Este agendamento não pode ser cancelado.');
  }

  const updated = await appointmentRepository.updateStatus(id, 'CANCELLED');
  return toAppointmentDTO(updated);
}

/** Transição de status por barbeiro (dono) ou admin. */
async function updateStatus(id, status, requester) {
  if (!STAFF_STATUSES.includes(status)) {
    throw ApiError.badRequest('Status inválido.');
  }
  const appt = await appointmentRepository.findByIdFull(id);
  if (!appt) throw ApiError.notFound('Agendamento não encontrado.');

  const isBarberOwner = requester.role === 'BARBER' && requester.id === appt.barber.userId;
  if (requester.role !== 'ADMIN' && !isBarberOwner) {
    throw ApiError.forbidden('Apenas o barbeiro responsável ou o admin podem alterar o status.');
  }

  const updated = await appointmentRepository.updateStatus(id, status);
  return toAppointmentDTO(updated);
}

async function rescheduleAppointment(id, newStartTime, requester) {
  const appt = await appointmentRepository.findByIdFull(id);
  if (!appt) throw ApiError.notFound('Agendamento não encontrado.');
  assertCanView(appt, requester);

  if (!RESCHEDULABLE.includes(appt.status)) {
    throw ApiError.badRequest('Somente agendamentos ativos podem ser reagendados.');
  }

  const startTime = new Date(newStartTime);
  if (Number.isNaN(startTime.getTime())) throw ApiError.badRequest('Horário inválido.');
  if (startTime.getTime() < Date.now()) throw ApiError.badRequest('Não é possível reagendar para o passado.');
  const endTime = new Date(startTime.getTime() + appt.totalDuration * 60_000);

  await scheduleService.assertBookable(appt.barberId, startTime, endTime);

  const updated = await appointmentRepository.rescheduleWithConflictCheck({
    id,
    barberId: appt.barberId,
    startTime,
    endTime,
  });
  return toAppointmentDTO(updated);
}

module.exports = {
  createAppointment,
  listAppointments,
  getAppointment,
  cancelAppointment,
  updateStatus,
  rescheduleAppointment,
};
