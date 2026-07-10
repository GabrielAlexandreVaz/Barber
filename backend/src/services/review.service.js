'use strict';

const { ApiError } = require('../utils/apiError');
const reviewRepository = require('../repositories/review.repository');
const appointmentRepository = require('../repositories/appointment.repository');
const clientRepository = require('../repositories/client.repository');
const barberRepository = require('../repositories/barber.repository');

/**
 * Cria a avaliação de um atendimento. Regras:
 * - somente o cliente dono do agendamento;
 * - somente se o atendimento estiver COMPLETED;
 * - apenas uma avaliação por atendimento.
 */
async function createReview(appointmentId, input, requester) {
  if (requester.role !== 'CLIENT') {
    throw ApiError.forbidden('Apenas clientes podem avaliar atendimentos.');
  }

  const appt = await appointmentRepository.findByIdFull(appointmentId);
  if (!appt) throw ApiError.notFound('Agendamento não encontrado.');

  if (requester.id !== appt.client.userId) {
    throw ApiError.forbidden('Você só pode avaliar os seus atendimentos.');
  }
  if (appt.status !== 'COMPLETED') {
    throw ApiError.badRequest('Só é possível avaliar atendimentos finalizados.');
  }

  const existing = await reviewRepository.findByAppointmentId(appointmentId);
  if (existing) throw ApiError.conflict('Este atendimento já foi avaliado.');

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw ApiError.badRequest('A nota deve ser de 1 a 5.');
  }

  const review = await reviewRepository.create({
    appointmentId,
    clientId: appt.clientId,
    barberId: appt.barberId,
    rating,
    comment: input.comment?.trim() || null,
  });

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

/** Lista as avaliações de um barbeiro com a média e a contagem. */
async function listBarberReviews(barberId) {
  const barber = await barberRepository.findById(barberId);
  if (!barber) throw ApiError.notFound('Barbeiro não encontrado.');

  const [reviews, agg] = await Promise.all([
    reviewRepository.findByBarber(barberId),
    reviewRepository.aggregateByBarber(barberId),
  ]);

  return {
    average: agg._avg.rating ? Number(agg._avg.rating.toFixed(2)) : 0,
    count: agg._count._all,
    items: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      clientName: r.client.user.name,
      createdAt: r.createdAt,
    })),
  };
}

/**
 * Mapa de { barberId: { average, count } } para uma lista de barbeiros.
 * Usado para enriquecer a listagem de barbeiros com a nota média.
 */
async function getRatingsMap(barberIds) {
  if (barberIds.length === 0) return {};
  const grouped = await reviewRepository.groupByBarbers(barberIds);
  const map = {};
  for (const g of grouped) {
    map[g.barberId] = {
      average: g._avg.rating ? Number(g._avg.rating.toFixed(2)) : 0,
      count: g._count._all,
    };
  }
  return map;
}

module.exports = { createReview, listBarberReviews, getRatingsMap };
