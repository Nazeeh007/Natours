const express = require('express');
const Router = express.Router();
const {
  protect,
  restrictedRoutes,
} = require('./../controllers/authController');
const {
  getCheckoutSession,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
Router.route('/checkout-session/:tourId').get(protect, getCheckoutSession); //get checkout session for a specific tour
//only admin and lead guid can do this crud
Router.use(protect, restrictedRoutes('admin', 'lead-guide'));
//CRUD for bookings
Router.route('/')
  .get(getAllBookings) //get all bookings
  .post(createBooking); //create a booking
Router.route('/:id')
  .get(getBooking) //get a specific booking
  .patch(updateBooking) //update a specific booking
  .delete(deleteBooking); //delete a specific booking

module.exports = Router;
