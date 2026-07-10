'use strict';

const { Router } = require('express');

const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { authLimiter } = require('../middlewares/rateLimit');
const {
  registerRules,
  loginRules,
  refreshRules,
} = require('../validators/auth.validator');

const router = Router();

// Rotas públicas (com rate limit reforçado contra brute-force)
router.post('/register', authLimiter, validate(registerRules), authController.register);
router.post('/login', authLimiter, validate(loginRules), authController.login);
router.post('/refresh', authLimiter, validate(refreshRules), authController.refresh);
router.post('/logout', authController.logout);

// Rotas protegidas
router.get('/me', authenticate, authController.me);

// Rota temporária para validar o RBAC durante a verificação da fundação.
// TODO: remover na Etapa 4 (será substituída por rotas reais de admin).
router.get('/admin-check', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ success: true, message: `Acesso admin confirmado para ${req.user.email}.` });
});

module.exports = router;
