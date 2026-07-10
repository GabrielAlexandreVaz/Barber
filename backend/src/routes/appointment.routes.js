'use strict';

const { Router } = require('express');

const appointmentController = require('../controllers/appointment.controller');
const reviewController = require('../controllers/review.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
  idParamRules,
  createRules,
  listRules,
  setStatusRules,
  rescheduleRules,
} = require('../validators/appointment.validator');
const { createReviewRules } = require('../validators/review.validator');

const router = Router();

router.use(authenticate);

// Criar — cliente (para si) ou admin (para um cliente)
router.post('/', authorize('CLIENT', 'ADMIN'), validate(createRules), appointmentController.create);

// Listar — filtrado por papel no service
router.get('/', validate(listRules), appointmentController.list);
router.get('/:id', validate(idParamRules), appointmentController.getById);

// Ações
router.patch('/:id/cancel', validate(idParamRules), appointmentController.cancel);
router.patch('/:id/reschedule', validate(rescheduleRules), appointmentController.reschedule);
// Transição de status — apenas barbeiro responsável ou admin (verificado no service)
router.patch('/:id/status', authorize('BARBER', 'ADMIN'), validate(setStatusRules), appointmentController.setStatus);

// Avaliação do atendimento — apenas o cliente dono, se COMPLETED (verificado no service)
router.post('/:id/review', authorize('CLIENT'), validate(createReviewRules), reviewController.createForAppointment);

module.exports = router;
