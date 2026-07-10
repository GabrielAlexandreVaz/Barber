'use strict';

const { ApiError } = require('../utils/apiError');
const { hashPassword } = require('../utils/password');
const barberRepository = require('../repositories/barber.repository');
const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const reviewService = require('./review.service');

/** Monta o DTO público do barbeiro (achata User + Barber + nota média). */
function toBarberDTO(barber, rating = { average: 0, count: 0 }) {
  if (!barber) return null;
  return {
    id: barber.id,
    userId: barber.userId,
    name: barber.user.name,
    email: barber.user.email,
    phone: barber.user.phone,
    avatarUrl: barber.user.avatarUrl,
    specialty: barber.specialty,
    bio: barber.bio,
    photoUrl: barber.photoUrl,
    instagram: barber.instagram,
    socials: barber.socials,
    isActive: barber.isActive && barber.user.isActive,
    averageRating: rating.average,
    reviewsCount: rating.count,
    createdAt: barber.createdAt,
  };
}

/** Separa os campos do payload entre os que pertencem ao User e ao Barber. */
function splitFields(input) {
  const userData = pickDefined({ name: input.name, phone: input.phone, avatarUrl: input.avatarUrl });
  const barberData = pickDefined({
    specialty: input.specialty,
    bio: input.bio,
    photoUrl: input.photoUrl,
    instagram: input.instagram,
    socials: input.socials,
  });
  return { userData, barberData };
}

async function listBarbers({ includeInactive = false } = {}) {
  const barbers = await barberRepository.findMany({ includeInactive });
  const ratings = await reviewService.getRatingsMap(barbers.map((b) => b.id));
  return barbers.map((b) => toBarberDTO(b, ratings[b.id]));
}

async function getBarber(id) {
  const barber = await barberRepository.findById(id);
  if (!barber) throw ApiError.notFound('Barbeiro não encontrado.');
  const ratings = await reviewService.getRatingsMap([id]);
  return toBarberDTO(barber, ratings[id]);
}

/** Cria um barbeiro (User BARBER + perfil Barber). */
async function createBarber(input) {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) throw ApiError.conflict('E-mail já cadastrado.');

  const barberRole = await roleRepository.findByName('BARBER');
  if (!barberRole) throw ApiError.internal('Papel BARBER não encontrado. Rode o seed.');

  const passwordHash = await hashPassword(input.password);
  const { barberData } = splitFields(input);

  const created = await barberRepository.create({
    userData: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      roleId: barberRole.id,
    },
    barberData,
  });

  return getBarber(created.barber.id);
}

/**
 * Atualiza um barbeiro. Admin pode qualquer um; um barbeiro só o próprio perfil.
 * @param {string} id barberId
 * @param {object} input
 * @param {{ id: string, role: string }} requester
 */
async function updateBarber(id, input, requester) {
  const barber = await barberRepository.findById(id);
  if (!barber) throw ApiError.notFound('Barbeiro não encontrado.');

  const isOwner = requester.role === 'BARBER' && barber.userId === requester.id;
  if (requester.role !== 'ADMIN' && !isOwner) {
    throw ApiError.forbidden('Você não pode editar este barbeiro.');
  }

  const { userData, barberData } = splitFields(input);
  if (Object.keys(userData).length > 0) {
    await barberRepository.updateUser(barber.userId, userData);
  }
  const updated =
    Object.keys(barberData).length > 0
      ? await barberRepository.update(id, barberData)
      : await barberRepository.findById(id);

  return toBarberDTO(updated);
}

async function setBarberActive(id, isActive) {
  const barber = await barberRepository.findById(id);
  if (!barber) throw ApiError.notFound('Barbeiro não encontrado.');
  const updated = await barberRepository.setActive(id, barber.userId, isActive);
  return toBarberDTO(updated);
}

/** Perfil de barbeiro do usuário autenticado. */
async function getMyProfile(userId) {
  const barber = await barberRepository.findByUserId(userId);
  if (!barber) throw ApiError.notFound('Perfil de barbeiro não encontrado.');
  return toBarberDTO(barber);
}

async function updateMyProfile(userId, input) {
  const barber = await barberRepository.findByUserId(userId);
  if (!barber) throw ApiError.notFound('Perfil de barbeiro não encontrado.');
  return updateBarber(barber.id, input, { id: userId, role: 'BARBER' });
}

function pickDefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

module.exports = {
  listBarbers,
  getBarber,
  createBarber,
  updateBarber,
  setBarberActive,
  getMyProfile,
  updateMyProfile,
};
