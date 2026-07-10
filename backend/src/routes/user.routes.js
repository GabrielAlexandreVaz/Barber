'use strict';

const { Router } = require('express');

const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
  updateProfileRules,
  changePasswordRules,
  listRules,
  idParamRules,
  adminUpdateRules,
  setStatusRules,
} = require('../validators/user.validator');

const router = Router();

// Todas as rotas de usuários exigem autenticação
router.use(authenticate);

// --- Perfil próprio (qualquer usuário autenticado) ---
router.get('/me', userController.getMe);
router.patch('/me', validate(updateProfileRules), userController.updateMe);
router.patch('/me/password', validate(changePasswordRules), userController.changePassword);

// --- Gestão administrativa ---
router.get('/', authorize('ADMIN'), validate(listRules), userController.list);
router.get('/:id', authorize('ADMIN'), validate(idParamRules), userController.getById);
router.patch('/:id', authorize('ADMIN'), validate(adminUpdateRules), userController.adminUpdate);
router.patch('/:id/status', authorize('ADMIN'), validate(setStatusRules), userController.setStatus);

module.exports = router;
