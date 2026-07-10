'use strict';

const { ApiError } = require('../utils/apiError');
const {
  isValidTimeString,
  isValidDateString,
  timeToMinutes,
  minutesToTime,
  weekdayOf,
  dateAtMinutes,
  dayBounds,
  overlaps,
} = require('../utils/time');

const barberRepository = require('../repositories/barber.repository');
const workingHourRepository = require('../repositories/workingHour.repository');
const blockedDateRepository = require('../repositories/blockedDate.repository');
const appointmentRepository = require('../repositories/appointment.repository');

const DEFAULT_STEP_MINUTES = 15;

/** Garante que o barbeiro existe; retorna o registro. */
async function ensureBarber(barberId) {
  const barber = await barberRepository.findById(barberId);
  if (!barber) throw ApiError.notFound('Barbeiro não encontrado.');
  return barber;
}

/** Admin pode gerenciar qualquer agenda; barbeiro apenas a própria. */
function assertCanManage(barber, requester) {
  const isOwner = requester.role === 'BARBER' && barber.userId === requester.id;
  if (requester.role !== 'ADMIN' && !isOwner) {
    throw ApiError.forbidden('Você não pode gerenciar a agenda deste barbeiro.');
  }
}

// ---------------- Horários de trabalho ----------------

async function getWorkingHours(barberId) {
  await ensureBarber(barberId);
  return workingHourRepository.findByBarber(barberId);
}

async function setWorkingHours(barberId, entries, requester) {
  const barber = await ensureBarber(barberId);
  assertCanManage(barber, requester);

  const normalized = validateWorkingHours(entries);
  return workingHourRepository.replaceForBarber(barberId, normalized);
}

function validateWorkingHours(entries) {
  if (!Array.isArray(entries)) {
    throw ApiError.badRequest('Envie uma lista de horários.');
  }

  const byWeekday = new Map();
  for (const e of entries) {
    if (!Number.isInteger(e.weekday) || e.weekday < 0 || e.weekday > 6) {
      throw ApiError.badRequest('Dia da semana inválido (use 0 a 6).');
    }
    if (!isValidTimeString(e.startTime) || !isValidTimeString(e.endTime)) {
      throw ApiError.badRequest('Horário inválido (use o formato HH:MM).');
    }
    if (timeToMinutes(e.startTime) >= timeToMinutes(e.endTime)) {
      throw ApiError.badRequest('O horário de início deve ser antes do fim.');
    }
    const list = byWeekday.get(e.weekday) || [];
    list.push(e);
    byWeekday.set(e.weekday, list);
  }

  // Impede intervalos sobrepostos no mesmo dia
  for (const list of byWeekday.values()) {
    const sorted = [...list].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    for (let i = 1; i < sorted.length; i += 1) {
      if (timeToMinutes(sorted[i].startTime) < timeToMinutes(sorted[i - 1].endTime)) {
        throw ApiError.badRequest('Há intervalos de trabalho sobrepostos no mesmo dia.');
      }
    }
  }

  return entries.map((e) => ({
    weekday: e.weekday,
    startTime: e.startTime,
    endTime: e.endTime,
  }));
}

// ---------------- Bloqueios / folgas ----------------

async function listBlockedDates(barberId, { from, to }) {
  await ensureBarber(barberId);
  // Janela padrão: próximos 60 dias
  const start = from ? new Date(from) : new Date();
  const end = to ? new Date(to) : new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
  return blockedDateRepository.findByBarberAndRange(barberId, start, end);
}

async function createBlockedDate(barberId, input, requester) {
  const barber = await ensureBarber(barberId);
  assertCanManage(barber, requester);

  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    throw ApiError.badRequest('Datas de bloqueio inválidas.');
  }
  if (startAt >= endAt) {
    throw ApiError.badRequest('O início do bloqueio deve ser antes do fim.');
  }

  return blockedDateRepository.create({
    barberId,
    startAt,
    endAt,
    reason: input.reason || null,
  });
}

async function deleteBlockedDate(barberId, blockedId, requester) {
  const barber = await ensureBarber(barberId);
  assertCanManage(barber, requester);

  const block = await blockedDateRepository.findById(blockedId);
  if (!block || block.barberId !== barberId) {
    throw ApiError.notFound('Bloqueio não encontrado.');
  }
  await blockedDateRepository.remove(blockedId);
}

// ---------------- Disponibilidade ----------------

/**
 * Calcula os horários livres de um barbeiro em uma data para uma duração.
 * Desconta expediente, bloqueios, agendamentos ativos e horários passados.
 *
 * @param {string} barberId
 * @param {string} dateStr "YYYY-MM-DD"
 * @param {number} durationMinutes duração total do atendimento
 * @param {{ stepMinutes?: number }} options granularidade dos slots
 * @returns {Promise<Array<{ time, start, end }>>}
 */
async function getAvailability(barberId, dateStr, durationMinutes, options = {}) {
  await ensureBarber(barberId);

  if (!isValidDateString(dateStr)) {
    throw ApiError.badRequest('Data inválida (use YYYY-MM-DD).');
  }
  const duration = Number(durationMinutes);
  if (!Number.isInteger(duration) || duration < 1 || duration > 600) {
    throw ApiError.badRequest('Duração inválida.');
  }
  const step = Number(options.stepMinutes) > 0 ? Number(options.stepMinutes) : DEFAULT_STEP_MINUTES;

  const weekday = weekdayOf(dateStr);
  const intervals = await workingHourRepository.findActiveByBarberAndWeekday(barberId, weekday);
  if (intervals.length === 0) return [];

  const { start: dayStart, end: dayEnd } = dayBounds(dateStr);
  const [blocks, appts] = await Promise.all([
    blockedDateRepository.findByBarberAndRange(barberId, new Date(dayStart), new Date(dayEnd)),
    appointmentRepository.findBlockingByBarberAndRange(barberId, new Date(dayStart), new Date(dayEnd)),
  ]);

  const busy = [
    ...blocks.map((b) => [b.startAt.getTime(), b.endAt.getTime()]),
    ...appts.map((a) => [a.startTime.getTime(), a.endTime.getTime()]),
  ];

  const now = Date.now();
  const slots = [];

  for (const interval of intervals) {
    const startM = timeToMinutes(interval.startTime);
    const endM = timeToMinutes(interval.endTime);

    for (let cursor = startM; cursor + duration <= endM; cursor += step) {
      const slotStart = dateAtMinutes(dateStr, cursor);
      const slotEnd = slotStart + duration * 60_000;

      if (slotStart < now) continue; // não oferece horário passado
      const conflict = busy.some(([bs, be]) => overlaps(slotStart, slotEnd, bs, be));
      if (conflict) continue;

      slots.push({
        time: minutesToTime(cursor),
        start: new Date(slotStart).toISOString(),
        end: new Date(slotEnd).toISOString(),
      });
    }
  }

  return slots;
}

/**
 * Valida que o intervalo [startDate, endDate] cabe no expediente do barbeiro e
 * não colide com bloqueios/folgas. A checagem de conflito com outros
 * agendamentos é feita transacionalmente na criação (appointment.repository).
 */
async function assertBookable(barberId, startDate, endDate) {
  const weekday = startDate.getDay();
  const intervals = await workingHourRepository.findActiveByBarberAndWeekday(barberId, weekday);

  const startM = startDate.getHours() * 60 + startDate.getMinutes();
  const durationMin = Math.round((endDate.getTime() - startDate.getTime()) / 60_000);
  const endM = startM + durationMin;

  const fits = intervals.some(
    (iv) => timeToMinutes(iv.startTime) <= startM && endM <= timeToMinutes(iv.endTime),
  );
  if (!fits) {
    throw ApiError.badRequest('Horário fora do expediente do barbeiro.');
  }

  const blocks = await blockedDateRepository.findByBarberAndRange(barberId, startDate, endDate);
  if (blocks.length > 0) {
    throw ApiError.conflict('Horário indisponível (folga/bloqueio do barbeiro).');
  }
}

module.exports = {
  getWorkingHours,
  setWorkingHours,
  listBlockedDates,
  createBlockedDate,
  deleteBlockedDate,
  getAvailability,
  assertBookable,
};
