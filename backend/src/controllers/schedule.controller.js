'use strict';

const asyncHandler = require('../utils/asyncHandler');
const scheduleService = require('../services/schedule.service');

const getWorkingHours = asyncHandler(async (req, res) => {
  const data = await scheduleService.getWorkingHours(req.params.barberId);
  res.json({ success: true, data });
});

const setWorkingHours = asyncHandler(async (req, res) => {
  const data = await scheduleService.setWorkingHours(req.params.barberId, req.body.entries, req.user);
  res.json({ success: true, data });
});

const listBlockedDates = asyncHandler(async (req, res) => {
  const data = await scheduleService.listBlockedDates(req.params.barberId, {
    from: req.query.from,
    to: req.query.to,
  });
  res.json({ success: true, data });
});

const createBlockedDate = asyncHandler(async (req, res) => {
  const data = await scheduleService.createBlockedDate(req.params.barberId, req.body, req.user);
  res.status(201).json({ success: true, data });
});

const deleteBlockedDate = asyncHandler(async (req, res) => {
  await scheduleService.deleteBlockedDate(req.params.barberId, req.params.blockedId, req.user);
  res.json({ success: true, message: 'Bloqueio removido.' });
});

const getAvailability = asyncHandler(async (req, res) => {
  const data = await scheduleService.getAvailability(
    req.params.barberId,
    req.query.date,
    req.query.duration,
    { stepMinutes: req.query.step },
  );
  res.json({ success: true, data });
});

module.exports = {
  getWorkingHours,
  setWorkingHours,
  listBlockedDates,
  createBlockedDate,
  deleteBlockedDate,
  getAvailability,
};
