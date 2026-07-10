'use strict';

const { Router } = require('express');

const settingController = require('../controllers/setting.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = Router();

// Leitura pública (landing page usa nome/logo da barbearia)
router.get('/', settingController.getAll);

// Escrita apenas admin
router.put('/', authenticate, authorize('ADMIN'), settingController.update);

module.exports = router;
