'use strict';

const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const barberRoutes = require('./barber.routes');
const scheduleRoutes = require('./schedule.routes');
const serviceRoutes = require('./service.routes');
const appointmentRoutes = require('./appointment.routes');
const dashboardRoutes = require('./dashboard.routes');
const uploadRoutes = require('./upload.routes');
const reportRoutes = require('./report.routes');
const settingRoutes = require('./setting.routes');

const router = Router();

// Health check — usado pelo PM2/Nginx e pela verificação end-to-end
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'the-guetto-api' });
});

// Domínios
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/barbers', barberRoutes);
// Agenda montada sob /barbers (paths com segmento extra: /:barberId/working-hours etc.)
router.use('/barbers', scheduleRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/uploads', uploadRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingRoutes);

module.exports = router;
