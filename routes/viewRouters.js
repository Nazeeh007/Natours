const express = require('express');
const Router = express.Router();
const viewController = require('./../controllers/viewController');
const { isLoggedIn, protect } = require('./../controllers/authController');
const {
  createBookingCheckoutSession,
} = require('./../controllers/bookingController');
Router.get(
  '/',
  createBookingCheckoutSession,
  isLoggedIn,
  viewController.getOverview
);
Router.get('/tour/:slug', isLoggedIn, viewController.getTour);
Router.get('/login', isLoggedIn, viewController.getLogin);
Router.get('/signup', isLoggedIn, viewController.getSignup);
Router.get('/me', protect, viewController.getAccount);
Router.get('/my-tours', protect, viewController.getMyTours);
Router.get('/my-reviews', protect, viewController.getMyReviews);
Router.get('/my-settings', protect, viewController.getMySetting);

// Router.post('/submit-user-data', protect, viewController.updateUserData); without using API

module.exports = Router;
