'use strict';

/**
 * Seed inicial do The Guetto Barber.
 * Idempotente: pode ser rodado múltiplas vezes sem duplicar dados (usa upsert).
 *
 * Cria: roles (CLIENT/BARBER/ADMIN), usuário admin, 1 barbeiro exemplo com
 * horários de trabalho, alguns serviços e as configurações da barbearia.
 */

const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const env = {
  adminName: process.env.SEED_ADMIN_NAME || 'Administrador',
  adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@theguetto.com',
  adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
};

async function main() {
  // 1) Roles
  const roleData = [
    { name: 'CLIENT', description: 'Cliente da barbearia' },
    { name: 'BARBER', description: 'Barbeiro / profissional' },
    { name: 'ADMIN', description: 'Administrador do sistema' },
  ];
  for (const r of roleData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const barberRole = await prisma.role.findUnique({ where: { name: 'BARBER' } });

  // 2) Admin
  const adminHash = await bcrypt.hash(env.adminPassword, 12);
  await prisma.user.upsert({
    where: { email: env.adminEmail },
    update: {},
    create: {
      name: env.adminName,
      email: env.adminEmail,
      passwordHash: adminHash,
      roleId: adminRole.id,
    },
  });

  // 3) Barbeiro exemplo
  const barberEmail = 'barbeiro@theguetto.com';
  const barberHash = await bcrypt.hash('Barber@123', 12);
  const barberUser = await prisma.user.upsert({
    where: { email: barberEmail },
    update: {},
    create: {
      name: 'Rafa Guetto',
      email: barberEmail,
      passwordHash: barberHash,
      roleId: barberRole.id,
      barber: {
        create: {
          specialty: 'Cortes clássicos e degradê',
          bio: 'Barbeiro referência da The Guetto, especialista em navalhado.',
          instagram: '@theguettoofc',
          socials: { instagram: 'https://www.instagram.com/theguettoofc/' },
        },
      },
    },
    include: { barber: true },
  });

  // 4) Horários de trabalho do barbeiro (terça a sábado, 09h-19h)
  if (barberUser.barber) {
    for (const weekday of [2, 3, 4, 5, 6]) {
      await prisma.workingHour.upsert({
        where: {
          barberId_weekday_startTime: {
            barberId: barberUser.barber.id,
            weekday,
            startTime: '09:00',
          },
        },
        update: {},
        create: {
          barberId: barberUser.barber.id,
          weekday,
          startTime: '09:00',
          endTime: '19:00',
        },
      });
    }
  }

  // 5) Serviços
  const services = [
    { name: 'Corte Masculino', price: 45.0, durationMinutes: 40, category: 'Cabelo', description: 'Corte na tesoura e máquina.' },
    { name: 'Barba', price: 35.0, durationMinutes: 30, category: 'Barba', description: 'Modelagem e toalha quente.' },
    { name: 'Corte + Barba', price: 70.0, durationMinutes: 60, category: 'Combo', description: 'Combo completo The Guetto.' },
  ];
  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }

  // 6) Configurações da barbearia
  const settings = [
    { key: 'shop.name', value: 'The Guetto Barber' },
    { key: 'shop.instagram', value: 'https://www.instagram.com/theguettoofc/' },
    { key: 'shop.openingHours', value: { tue_sat: '09:00-19:00', sun_mon: 'closed' } },
  ];
  for (const st of settings) {
    await prisma.setting.upsert({
      where: { key: st.key },
      update: { value: st.value },
      create: st,
    });
  }

  console.log('Seed concluído com sucesso.');
  console.log(`Admin: ${env.adminEmail} / senha definida no .env (SEED_ADMIN_PASSWORD)`);
  console.log('Barbeiro: barbeiro@theguetto.com / Barber@123');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
