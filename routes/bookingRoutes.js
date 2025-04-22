const express = require('express');
const Router = express.Router();
const {
  protect,
  restrictedRoutes,
} = require('./../controllers/authController');
const {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getCheckoutSession,
} = require('../controllers/bookingController');
Router.route('/checkout-session/:tourId').get(protect, getCheckoutSession); //get checkout session for a specific tour
module.exports = Router;
