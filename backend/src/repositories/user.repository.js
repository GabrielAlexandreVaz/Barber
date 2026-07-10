'use strict';

const prisma = require('../config/prisma');

/**
 * Acesso ao agregado User. Services nunca chamam o Prisma diretamente —
 * toda persistência de usuário passa por aqui.
 */

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

module.exports = {
  findById,
  findByEmail,
  createClientUser,
};
