'use strict';

const asyncHandler = require('../utils/asyncHandler');
const barberService = require('../services/barber.service');

const list = asyncHandler(async (req, res) => {
  // Somente admin pode incluir barbeiros inativos na listagem
  const includeInactive = req.user.role === 'ADMIN' && req.query.includeInactive === 'true';
  const barbers = await barberService.listBarbers({ includeInactive });
  res.json({ success: true, data: barbers });
});

const getMe = asyncHandler(async (req, res) => {
  const barber = await barberService.getMyProfile(req.user.id);
  res.json({ success: true, data: barber });
});

const updateMe = asyncHandler(async (req, res) => {
  const barber = await barberService.updateMyProfile(req.user.id, req.body);
  res.json({ success: true, data: barber });
});

const getById = asyncHandler(async (req, res) => {
  const barber = await barberService.getBarber(req.params.id);
  res.json({ success: true, data: barber });
});

const create = asyncHandler(async (req, res) => {
  const barber = await barberService.createBarber(req.body);
  res.status(201).json({ success: true, data: barber });
});

const update = asyncHandler(async (req, res) => {
  const barber = await barberService.updateBarber(req.params.id, req.body, req.user);
  res.json({ success: true, data: barber });
});

const setStatus = asyncHandler(async (req, res) => {
  const barber = await barberService.setBarberActive(req.params.id, req.body.isActive);
  res.json({ success: true, data: barber });
});

module.exports = { list, getMe, updateMe, getById, create, update, setStatus };
