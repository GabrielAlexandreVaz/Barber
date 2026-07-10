'use strict';

const { Router } = require('express');
const authRoutes = require('./auth.routes');

const router = Router();

// Health check — usado pelo PM2/Nginx e pela verificação end-to-end
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'the-guetto-api' });
});

// Domínios
router.use('/auth', authRoutes);

module.exports = router;
