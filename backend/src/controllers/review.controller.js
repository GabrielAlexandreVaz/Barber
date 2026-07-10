'use strict';

const asyncHandler = require('../utils/asyncHandler');
const reviewService = require('../services/review.service');

const createForAppointment = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.params.id,
    { rating: req.body.rating, comment: req.body.comment },
    req.user,
  );
  res.status(201).json({ success: true, data: review });
});

const listForBarber = asyncHandler(async (req, res) => {
  const data = await reviewService.listBarberReviews(req.params.id);
  res.json({ success: true, data });
});

module.exports = { createForAppointment, listForBarber };
