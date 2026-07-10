'use strict';

const { ApiError } = require('../utils/apiError');
const { hashPassword, comparePassword } = require('../utils/password');
const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');

/** Perfil do próprio usuário autenticado. */
async function getProfile(userId) {
  const user = await userRepository.findPublicById(userId);
  if (!user) throw ApiError.notFound('Usuário não encontrado.');
  return user;
}

/** Atualiza o próprio perfil (campos permitidos ao usuário). */
async function updateProfile(userId, input) {
  const data = pickDefined({
    name: input.name,
    phone: input.phone,
    avatarUrl: input.avatarUrl,
  });
  return userRepository.updateProfile(userId, data);
}

/**
 * Troca de senha do próprio usuário. Exige a senha atual e revoga todas as
 * sessões (refresh tokens) por segurança.
 */
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('Usuário não encontrado.');

  const ok = await comparePassword(currentPassword, user.passwordHash);
  if (!ok) throw ApiError.badRequest('Senha atual incorreta.');

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, passwordHash);
  await refreshTokenRepository.revokeAllForUser(userId);
}

/** Lista paginada de usuários (admin). */
async function listUsers({ page = 1, limit = 20, search, role, isActive }) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * take;

  const filters = { search, role, isActive };
  const [items, total] = await Promise.all([
    userRepository.findMany({ skip, take, ...filters }),
    userRepository.count(filters),
  ]);

  return {
    items,
    pagination: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

/** Busca de um usuário por id (admin). */
async function getUserById(id) {
  const user = await userRepository.findPublicById(id);
  if (!user) throw ApiError.notFound('Usuário não encontrado.');
  return user;
}

/** Atualização administrativa de um usuário (dados + papel). */
async function adminUpdateUser(id, input) {
  const target = await userRepository.findById(id);
  if (!target) throw ApiError.notFound('Usuário não encontrado.');

  const data = pickDefined({
    name: input.name,
    phone: input.phone,
    avatarUrl: input.avatarUrl,
  });

  if (input.role) {
    const role = await roleRepository.findByName(input.role);
    if (!role) throw ApiError.badRequest('Papel inválido.');
    data.roleId = role.id;
  }

  return userRepository.updateProfile(id, data);
}

/**
 * Ativa/desativa um usuário (admin). Ao desativar, revoga as sessões.
 * Impede que o admin desative a própria conta.
 */
async function setUserActive(id, isActive, requesterId) {
  if (id === requesterId && isActive === false) {
    throw ApiError.badRequest('Você não pode desativar a própria conta.');
  }
  const target = await userRepository.findById(id);
  if (!target) throw ApiError.notFound('Usuário não encontrado.');

  const updated = await userRepository.setActive(id, isActive);
  if (!isActive) {
    await refreshTokenRepository.revokeAllForUser(id);
  }
  return updated;
}

/** Remove chaves com valor undefined para não sobrescrever com nada. */
function pickDefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  getUserById,
  adminUpdateUser,
  setUserActive,
};
