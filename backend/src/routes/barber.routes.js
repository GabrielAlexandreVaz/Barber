'use strict';

const { Router } = require('express');

const barberController = require('../controllers/barber.controller');
const reviewController = require('../controllers/review.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
  idParamRules,
  createRules,
  updateRules,
  updateMeRules,
  setStatusRules,
} = require('../validators/barber.validator');

const router = Router();

router.use(authenticate);

// Perfil do próprio barbeiro (rotas específicas antes de /:id)
router.get('/me', authorize('BARBER'), barberController.getMe);
router.patch('/me', authorize('BARBER'), validate(updateMeRules), barberController.updateMe);

// Listagem/detalhe (qualquer usuário autenticado — clientes escolhem o barbeiro)
router.get('/', barberController.list);
router.get('/:id', validate(idParamRules), barberController.getById);

// Avaliações do barbeiro (média + lista)
router.get('/:id/reviews', validate(idParamRules), reviewController.listForBarber);

// Gestão administrativa
router.post('/', authorize('ADMIN'), validate(createRules), barberController.create);
// Update: admin ou o próprio barbeiro (verificação fina no service)
router.patch('/:id', authorize('ADMIN', 'BARBER'), validate(updateRules), barberController.update);
router.patch('/:id/status', authorize('ADMIN'), validate(setStatusRules), barberController.setStatus);

module.exports = router;
