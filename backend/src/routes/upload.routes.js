'use strict';

const { Router } = require('express');

const { upload } = require('../config/multer');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const uploadController = require('../controllers/upload.controller');

const router = Router();

router.use(authenticate);

// Upload de imagem (barbeiros/serviços/logo) — equipe apenas
router.post('/', authorize('ADMIN', 'BARBER'), upload.single('file'), uploadController.uploadImage);

module.exports = router;
