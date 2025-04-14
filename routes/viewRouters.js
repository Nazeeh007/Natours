const express = require('express');
const Router = express.Router();
const viewController = require('./../controllers/viewController');
const { isLoggedIn } = require('./../controllers/authController');
Router.use(isLoggedIn); //this middleware will run for all the routes in this router
Router.get('/', viewController.getOverview);
Router.get('/tour/:slug', viewController.getTour);
Router.get('/login', viewController.getLogin);
Router.get('/signup', viewController.getSignup);

module.exports = Router;
