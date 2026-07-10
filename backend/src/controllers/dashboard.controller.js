'use strict';

const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const overview = asyncHandler(async (req, res) => {
  const { from, to, barberId } = req.query;
  const data = await dashboardService.getOverview(req.user, { from, to, barberId });
  res.json({ success: true, data });
});

module.exports = { overview };
