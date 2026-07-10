'use strict';

const { Router } = require('express');

const dashboardController = require('../controllers/dashboard.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { overviewRules } = require('../validators/dashboard.validator');

const router = Router();

router.use(authenticate);

// Dashboard é para equipe (admin vê tudo; barbeiro vê o próprio — escopo no service)
router.get('/overview', authorize('ADMIN', 'BARBER'), validate(overviewRules), dashboardController.overview);

module.exports = router;
