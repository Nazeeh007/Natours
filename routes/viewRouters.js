const express = require('express');
const Router = express.Router();
const viewController = require('./../controllers/viewController');
const { isLoggedIn, protect } = require('./../controllers/authController');
Router.get('/', isLoggedIn, viewController.getOverview);
Router.get('/tour/:slug', isLoggedIn, viewController.getTour);
Router.get('/login', isLoggedIn, viewController.getLogin);
Router.get('/signup', isLoggedIn, viewController.getSignup);
Router.get('/me', protect, viewController.getAccount);
// Router.post('/submit-user-data', protect, viewController.updateUserData); without using API

module.exports = Router;
