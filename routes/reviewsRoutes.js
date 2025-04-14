const express = require('express');
const Router = express.Router({ mergeParams: true }); //to merge params from parent route (to get thr tourID from the tour router)
const {
  setTourUserIds,
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController');
const {
  protect,
  restrictedRoutes,
} = require('./../controllers/authController');
Router.use(protect); //protect all routes after this line
Router.route('/')
  .get(getAllReviews)
  .post(restrictedRoutes('user'), setTourUserIds, createReview); //protect that user must be logged in
Router.route('/:id')
  .get(getReview)
  .patch(restrictedRoutes('user', 'admin'), updateReview);
Router.delete('/:id', restrictedRoutes('user', 'admin'), deleteReview); //only admin and user can delete their own review

module.exports = Router;
