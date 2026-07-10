'use strict';

const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/report.service');

const summary = asyncHandler(async (req, res) => {
  const data = await reportService.getSummary({ from: req.query.from, to: req.query.to });
  res.json({ success: true, data });
});

const exportCsv = asyncHandler(async (req, res) => {
  const csv = await reportService.buildAppointmentsCsv({ from: req.query.from, to: req.query.to });
  const filename = `relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  // BOM para o Excel reconhecer UTF-8 (acentos)
  res.send(`﻿${csv}`);
});

module.exports = { summary, exportCsv };
