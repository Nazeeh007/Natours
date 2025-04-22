const express = require('express');
const Router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  top5Tours,
  getToursState,
  getMonthlyPlan,
  getToursWithin,
  getDistance,
  uploadTourImages,
  resizeTourImages,
  getSearchedTours,
} = require('../controllers/tours');

const {
  protect,
  restrictedRoutes,
} = require('./../controllers/authController');
// const {
//   getAllReviews,
//   createReview,
// } = require('../controllers/reviewsController');
const reviewsRouter = require('./../routes/reviewsRoutes');
Router.use('/:tourId/reviews', reviewsRouter); //mounting the reviews router
Router.route('/monthly-plan/:year').get(
  protect,
  restrictedRoutes('lead-guide', 'admin', 'guide'),
  getMonthlyPlan
);
Router.route('/tour-stats').get(getToursState);
Router.route('/top-5-tour').get(top5Tours, getAllTours); //need to use middleware to get top 5 tours
Router.route('/')
  .get(getAllTours)
  .post(protect, restrictedRoutes('lead-guide', 'admin'), createTour); //middleware to protect the route
Router.route('/search').get(getSearchedTours); //searching tours by name
// Router.get('/:id', getTour)
//   .patch('/:id', updateTour)
//   .delete('/:id', deleteTour);
Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  getToursWithin
);
Router.route('/distances/:latlng/unit/:unit').get(getDistance);
Router.route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictedRoutes('lead-guide', 'admin'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictedRoutes('lead-guide', 'admin'), deleteTour);

module.exports = Router;
