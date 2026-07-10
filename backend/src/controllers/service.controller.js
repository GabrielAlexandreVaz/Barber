'use strict';

const asyncHandler = require('../utils/asyncHandler');
const serviceService = require('../services/service.service');

const list = asyncHandler(async (req, res) => {
  const includeInactive = req.user.role === 'ADMIN' && req.query.includeInactive === 'true';
  const services = await serviceService.listServices({ includeInactive });
  res.json({ success: true, data: services });
});

const getById = asyncHandler(async (req, res) => {
  const service = await serviceService.getService(req.params.id);
  res.json({ success: true, data: service });
});

const create = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(req.body);
  res.status(201).json({ success: true, data: service });
});

const update = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(req.params.id, req.body);
  res.json({ success: true, data: service });
});

const setStatus = asyncHandler(async (req, res) => {
  const service = await serviceService.setServiceActive(req.params.id, req.body.isActive);
  res.json({ success: true, data: service });
});

const remove = asyncHandler(async (req, res) => {
  await serviceService.deleteService(req.params.id);
  res.json({ success: true, message: 'Serviço removido.' });
});

module.exports = { list, getById, create, update, setStatus, remove };
