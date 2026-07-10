'use strict';

const { Router } = require('express');

const reportController = require('../controllers/report.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { rangeRules } = require('../validators/report.validator');

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN')); // relatórios são exclusivos do admin

router.get('/summary', validate(rangeRules), reportController.summary);
router.get('/export', validate(rangeRules), reportController.exportCsv);

module.exports = router;
