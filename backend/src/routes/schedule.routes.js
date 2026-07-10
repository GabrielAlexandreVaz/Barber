'use strict';

const { Router } = require('express');

const scheduleController = require('../controllers/schedule.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
  barberIdParam,
  setWorkingHoursRules,
  createBlockedRules,
  deleteBlockedRules,
  availabilityRules,
} = require('../validators/schedule.validator');

// Montado em /barbers — rotas com segmento extra (/:barberId/working-hours etc.)
// não conflitam com as rotas de barbeiro (GET /:id).
const router = Router();

router.use(authenticate);

// Horários de trabalho — leitura para qualquer autenticado; escrita admin ou dono
router.get('/:barberId/working-hours', validate(barberIdParam), scheduleController.getWorkingHours);
router.put(
  '/:barberId/working-hours',
  authorize('ADMIN', 'BARBER'),
  validate(setWorkingHoursRules),
  scheduleController.setWorkingHours,
);

// Bloqueios / folgas
router.get('/:barberId/blocked-dates', validate(barberIdParam), scheduleController.listBlockedDates);
router.post(
  '/:barberId/blocked-dates',
  authorize('ADMIN', 'BARBER'),
  validate(createBlockedRules),
  scheduleController.createBlockedDate,
);
router.delete(
  '/:barberId/blocked-dates/:blockedId',
  authorize('ADMIN', 'BARBER'),
  validate(deleteBlockedRules),
  scheduleController.deleteBlockedDate,
);

// Disponibilidade (horários livres) — qualquer autenticado (clientes agendam)
router.get('/:barberId/availability', validate(availabilityRules), scheduleController.getAvailability);

module.exports = router;
