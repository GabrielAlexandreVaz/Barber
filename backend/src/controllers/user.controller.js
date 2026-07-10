'use strict';

const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, avatarUrl } = req.body;
  const user = await userService.updateProfile(req.user.id, { name, phone, avatarUrl });
  res.json({ success: true, data: user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, { currentPassword, newPassword });
  res.json({ success: true, message: 'Senha alterada. Faça login novamente nos demais dispositivos.' });
});

const list = asyncHandler(async (req, res) => {
  const { page, limit, search, role, active } = req.query;
  const isActive = active === undefined ? undefined : active === 'true';
  const result = await userService.listUsers({ page, limit, search, role, isActive });
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ success: true, data: user });
});

const adminUpdate = asyncHandler(async (req, res) => {
  const { name, phone, avatarUrl, role } = req.body;
  const user = await userService.adminUpdateUser(req.params.id, { name, phone, avatarUrl, role });
  res.json({ success: true, data: user });
});

const setStatus = asyncHandler(async (req, res) => {
  const user = await userService.setUserActive(req.params.id, req.body.isActive, req.user.id);
  res.json({ success: true, data: user });
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
  list,
  getById,
  adminUpdate,
  setStatus,
};
