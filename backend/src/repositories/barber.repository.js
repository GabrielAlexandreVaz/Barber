'use strict';

const prisma = require('../config/prisma');

/**
 * Acesso ao agregado Barber (User com papel BARBER + perfil Barber).
 */

// Inclui os dados do usuário necessários para montar o DTO público
const withUser = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
    },
  },
};

/**
 * Cria User (papel BARBER) + perfil Barber numa única transação.
 * @param {{ userData, barberData }} params
 */
function create({ userData, barberData }) {
  return prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash,
      phone: userData.phone,
      roleId: userData.roleId,
      barber: { create: barberData },
    },
    include: { barber: true },
  });
}

function findMany({ includeInactive }) {
  const where = includeInactive ? {} : { isActive: true, user: { isActive: true } };
  return prisma.barber.findMany({
    where,
    include: withUser,
    orderBy: { createdAt: 'desc' },
  });
}

function findById(id) {
  return prisma.barber.findUnique({ where: { id }, include: withUser });
}

function findByUserId(userId) {
  return prisma.barber.findUnique({ where: { userId }, include: withUser });
}

function update(id, barberData) {
  return prisma.barber.update({ where: { id }, data: barberData, include: withUser });
}

/** Atualiza campos do User associado ao barbeiro. */
function updateUser(userId, userData) {
  return prisma.user.update({ where: { id: userId }, data: userData });
}

/** Ativa/desativa o barbeiro e o usuário associado de forma consistente. */
function setActive(id, userId, isActive) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { isActive } });
    return tx.barber.update({ where: { id }, data: { isActive }, include: withUser });
  });
}

module.exports = {
  create,
  findMany,
  findById,
  findByUserId,
  update,
  updateUser,
  setActive,
};
