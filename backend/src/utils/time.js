'use strict';

/**
 * Utilidades de tempo para a agenda.
 *
 * Premissa de fuso: os horários de trabalho ("HH:MM") e as datas de agendamento
 * são tratados na HORA LOCAL do servidor, assumida como a hora da barbearia
 * (VPS e ambiente de dev em horário de Brasília). Datas são construídas com
 * `new Date(y, m, d, ...)` (local), mantendo consistência com a criação de
 * agendamentos na Etapa 8.
 */

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isValidTimeString(value) {
  return typeof value === 'string' && TIME_REGEX.test(value);
}

/** "09:30" -> 570 (minutos desde a meia-noite). */
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** 570 -> "09:30". */
function minutesToTime(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Valida o formato "YYYY-MM-DD". */
function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Dia da semana (0=domingo..6=sábado) de uma data local "YYYY-MM-DD". */
function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Converte um Date para "YYYY-MM-DD" na hora local. */
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Combina "YYYY-MM-DD" + minutos desde a meia-noite em um Date local. */
function dateAtMinutes(dateStr, minutes) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime() + minutes * 60_000;
}

/** Início (00:00) e fim (24:00) de uma data local, como timestamps. */
function dayBounds(dateStr) {
  const start = dateAtMinutes(dateStr, 0);
  return { start, end: start + 24 * 60 * 60_000 };
}

/** Verifica se dois intervalos [aStart,aEnd) e [bStart,bEnd) se sobrepõem. */
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

module.exports = {
  isValidTimeString,
  isValidDateString,
  timeToMinutes,
  minutesToTime,
  weekdayOf,
  toDateStr,
  dateAtMinutes,
  dayBounds,
  overlaps,
};
