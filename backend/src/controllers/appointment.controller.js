'use strict';

const asyncHandler = require('../utils/asyncHandler');
const appointmentService = require('../services/appointment.service');

const create = asyncHandler(async (req, res) => {
  const { barberId, serviceIds, startTime, notes, clientId } = req.body;
  const appt = await appointmentService.createAppointment(
    { barberId, serviceIds, startTime, notes, clientId },
    req.user,
  );
  res.status(201).json({ success: true, data: appt });
});

const list = asyncHandler(async (req, res) => {
  const { status, from, to, barberId, clientId, page, limit } = req.query;
  const { items, pagination } = await appointmentService.listAppointments(req.user, {
    status,
    from,
    to,
    barberId,
    clientId,
    page,
    limit,
  });
  res.json({ success: true, data: items, pagination });
});

const getById = asyncHandler(async (req, res) => {
  const appt = await appointmentService.getAppointment(req.params.id, req.user);
  res.json({ success: true, data: appt });
});

const cancel = asyncHandler(async (req, res) => {
  const appt = await appointmentService.cancelAppointment(req.params.id, req.user);
  res.json({ success: true, data: appt });
});

const setStatus = asyncHandler(async (req, res) => {
  const appt = await appointmentService.updateStatus(req.params.id, req.body.status, req.user);
  res.json({ success: true, data: appt });
});

const reschedule = asyncHandler(async (req, res) => {
  const appt = await appointmentService.rescheduleAppointment(
    req.params.id,
    req.body.startTime,
    req.user,
  );
  res.json({ success: true, data: appt });
});

module.exports = { create, list, getById, cancel, setStatus, reschedule };
