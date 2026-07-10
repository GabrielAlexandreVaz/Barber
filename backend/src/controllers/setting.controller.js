'use strict';

const asyncHandler = require('../utils/asyncHandler');
const settingService = require('../services/setting.service');

const getAll = asyncHandler(async (req, res) => {
  const data = await settingService.getSettings();
  res.json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  // Aceita { settings: {...} } ou o objeto direto no corpo
  const payload = req.body.settings ?? req.body;
  const data = await settingService.updateSettings(payload);
  res.json({ success: true, data });
});

module.exports = { getAll, update };
