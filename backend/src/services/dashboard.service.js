'use strict';

const { ApiError } = require('../utils/apiError');
const { toDateStr } = require('../utils/time');
const dashboardRepository = require('../repositories/dashboard.repository');
const barberRepository = require('../repositories/barber.repository');

const BLOCKING = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

/** Início do dia local (00:00) para um Date. */
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

/**
 * Monta o overview do dashboard com escopo por papel.
 * - ADMIN: barbearia toda (ou filtra por barberId).
 * - BARBER: apenas os próprios agendamentos.
 *
 * @param {{ id, role }} requester
 * @param {{ from?, to?, barberId? }} filters
 */
async function getOverview(requester, filters = {}) {
  // Escopo de barbeiro
  let barberId;
  if (requester.role === 'BARBER') {
    const barber = await barberRepository.findByUserId(requester.id);
    if (!barber) throw ApiError.badRequest('Perfil de barbeiro não encontrado.');
    barberId = barber.id;
  } else if (requester.role === 'ADMIN') {
    barberId = filters.barberId || undefined;
  } else {
    throw ApiError.forbidden('Sem acesso ao dashboard.');
  }

  // Período (padrão: últimos 30 dias, incluindo hoje)
  const now = new Date();
  const to = filters.to ? new Date(filters.to) : new Date(startOfDay(now).getTime() + 24 * 60 * 60 * 1000);
  const from = filters.from
    ? new Date(filters.from)
    : new Date(startOfDay(now).getTime() - 29 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    throw ApiError.badRequest('Período inválido.');
  }

  const appts = await dashboardRepository.appointmentsInRange({ barberId, from, to });

  const todayStr = toDateStr(now);
  const nowMs = now.getTime();

  const byStatus = {
    SCHEDULED: 0,
    CONFIRMED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    NO_SHOW: 0,
  };

  let todayAppointments = 0;
  let periodRevenue = 0;
  let upcoming = 0;
  const servedClients = new Set();
  const revenueByDayMap = new Map();

  for (const a of appts) {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;

    if (toDateStr(a.startTime) === todayStr && BLOCKING.includes(a.status)) {
      todayAppointments += 1;
    }
    if (['SCHEDULED', 'CONFIRMED'].includes(a.status) && a.startTime.getTime() >= nowMs) {
      upcoming += 1;
    }
    if (a.status === 'COMPLETED') {
      const price = Number(a.totalPrice);
      periodRevenue += price;
      servedClients.add(a.clientId);
      const day = toDateStr(a.startTime);
      revenueByDayMap.set(day, (revenueByDayMap.get(day) || 0) + price);
    }
  }

  return {
    scope: requester.role === 'BARBER' ? 'BARBER' : 'ADMIN',
    period: { from: from.toISOString(), to: to.toISOString() },
    metrics: {
      todayAppointments,
      periodRevenue: Number(periodRevenue.toFixed(2)),
      completed: byStatus.COMPLETED,
      cancelled: byStatus.CANCELLED + byStatus.NO_SHOW,
      upcoming,
      clientsServed: servedClients.size,
    },
    byStatus,
    revenueByDay: buildRevenueSeries(from, to, revenueByDayMap),
  };
}

/** Série contínua de receita por dia (preenche dias sem receita com 0). */
function buildRevenueSeries(from, to, revenueByDayMap) {
  const series = [];
  const cursor = startOfDay(from);
  const end = to.getTime();
  // Limita a 92 dias para não gerar séries absurdamente longas
  let guard = 0;
  while (cursor.getTime() < end && guard < 92) {
    const day = toDateStr(cursor);
    series.push({ date: day, revenue: Number((revenueByDayMap.get(day) || 0).toFixed(2)) });
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return series;
}

module.exports = { getOverview };
