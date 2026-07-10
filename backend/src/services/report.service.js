'use strict';

const { ApiError } = require('../utils/apiError');
const reportRepository = require('../repositories/report.repository');

/** Resolve o intervalo do relatório (padrão: últimos 30 dias, incluindo hoje). */
function resolveRange(filters = {}) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = filters.to ? new Date(filters.to) : new Date(startToday.getTime() + 24 * 60 * 60 * 1000);
  const from = filters.from
    ? new Date(filters.from)
    : new Date(startToday.getTime() - 29 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    throw ApiError.badRequest('Período inválido.');
  }
  return { from, to };
}

async function getSummary(filters) {
  const range = resolveRange(filters);

  const [statusRows, barberRows, serviceRows] = await Promise.all([
    reportRepository.statusCounts(range),
    reportRepository.revenueByBarber(range),
    reportRepository.topServices(range),
  ]);

  // Contagem por status + totais
  const byStatus = {
    SCHEDULED: 0, CONFIRMED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0,
  };
  for (const r of statusRows) byStatus[r.status] = r._count._all;
  const total = Object.values(byStatus).reduce((a, n) => a + n, 0);
  const canceled = byStatus.CANCELLED + byStatus.NO_SHOW;
  const cancellationRate = total > 0 ? Number(((canceled / total) * 100).toFixed(1)) : 0;
  const totalRevenue = barberRows.reduce((a, r) => a + Number(r._sum.totalPrice || 0), 0);

  // Faturamento por barbeiro (resolve nomes)
  const barberNameMap = await namesToMap(
    reportRepository.barberNames(barberRows.map((r) => r.barberId)),
    (b) => [b.id, b.user.name],
  );
  const revenueByBarber = barberRows
    .map((r) => ({
      barberId: r.barberId,
      barberName: barberNameMap[r.barberId] || '—',
      completed: r._count._all,
      revenue: Number(Number(r._sum.totalPrice || 0).toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Serviços mais vendidos (resolve nomes)
  const serviceNameMap = await namesToMap(
    reportRepository.serviceNames(serviceRows.map((r) => r.serviceId)),
    (s) => [s.id, s.name],
  );
  const topServices = serviceRows
    .map((r) => ({
      serviceId: r.serviceId,
      serviceName: serviceNameMap[r.serviceId] || '—',
      count: r._count._all,
      revenue: Number(Number(r._sum.priceAtBooking || 0).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    period: { from: range.from.toISOString(), to: range.to.toISOString() },
    totals: {
      appointments: total,
      completed: byStatus.COMPLETED,
      canceled,
      cancellationRate,
      revenue: Number(totalRevenue.toFixed(2)),
    },
    byStatus,
    revenueByBarber,
    topServices,
  };
}

async function namesToMap(promise, toEntry) {
  const rows = await promise;
  return Object.fromEntries(rows.map(toEntry));
}

/** Gera o CSV dos atendimentos do período. */
async function buildAppointmentsCsv(filters) {
  const range = resolveRange(filters);
  const appts = await reportRepository.appointmentsForExport(range);

  const header = [
    'Data', 'Cliente', 'Barbeiro', 'Servicos', 'Status', 'Duracao(min)', 'Valor(R$)',
  ];
  const rows = appts.map((a) => [
    new Date(a.startTime).toLocaleString('pt-BR'),
    a.client.user.name,
    a.barber.user.name,
    a.services.map((s) => s.service.name).join(' + '),
    a.status,
    a.totalDuration,
    Number(a.totalPrice).toFixed(2).replace('.', ','),
  ]);

  return [header, ...rows].map((cols) => cols.map(csvCell).join(';')).join('\r\n');
}

/** Escapa um valor para CSV (aspas + separador seguro). */
function csvCell(value) {
  const s = String(value ?? '');
  if (/[";\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

module.exports = { getSummary, buildAppointmentsCsv };
