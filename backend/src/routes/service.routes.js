'use strict';

const { Router } = require('express');

const serviceController = require('../controllers/service.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
  idParamRules,
  createRules,
  updateRules,
  setStatusRules,
} = require('../validators/service.validator');

const router = Router();

router.use(authenticate);

// Listagem/detalhe — qualquer usuário autenticado (clientes escolhem no agendamento)
router.get('/', serviceController.list);
router.get('/:id', validate(idParamRules), serviceController.getById);

// Gestão administrativa
router.post('/', authorize('ADMIN'), validate(createRules), serviceController.create);
router.patch('/:id', authorize('ADMIN'), validate(updateRules), serviceController.update);
router.patch('/:id/status', authorize('ADMIN'), validate(setStatusRules), serviceController.setStatus);
router.delete('/:id', authorize('ADMIN'), validate(idParamRules), serviceController.remove);

module.exports = router;
