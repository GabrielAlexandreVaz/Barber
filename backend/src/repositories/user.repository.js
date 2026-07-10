'use strict';

const prisma = require('../config/prisma');

/**
 * Acesso ao agregado User. Services nunca chamam o Prisma diretamente —
 * toda persistência de usuário passa por aqui.
 */

// Seleção pública padrão (nunca expõe passwordHash)
const publicSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  role: { select: { name: true } },
};

function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true, client: true, barber: true },
  });
}

/** Retorna o usuário sem campos sensíveis (para respostas de API). */
function findPublicById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: publicSelect,
  });
}

/**
 * Cria um usuário cliente (User + perfil Client) numa única transação.
 * @param {{ name, email, passwordHash, phone?, roleId }} data
 */
function createClientUser(data) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      phone: data.phone,
      roleId: data.roleId,
      client: { create: {} },
    },
    include: { role: true, client: true },
  });
}

/**
 * Lista paginada com busca por nome/e-mail e filtro por papel.
 * @param {{ skip, take, search?, role?, isActive? }} params
 */
function findMany({ skip, take, search, role, isActive }) {
  const where = buildWhere({ search, role, isActive });
  return prisma.user.findMany({
    where,
    select: publicSelect,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
}

function count({ search, role, isActive }) {
  return prisma.user.count({ where: buildWhere({ search, role, isActive }) });
}

function buildWhere({ search, role, isActive }) {
  const where = {};
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (role) where.role = { name: role };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  return where;
}

/** Atualiza campos de perfil e retorna a versão pública. */
function updateProfile(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: publicSelect,
  });
}

function updatePassword(id, passwordHash) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
    select: { id: true },
  });
}

function setActive(id, isActive) {
  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: publicSelect,
  });
}

module.exports = {
  publicSelect,
  findById,
  findByEmail,
  findPublicById,
  createClientUser,
  findMany,
  count,
  updateProfile,
  updatePassword,
  setActive,
};
