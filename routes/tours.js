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
} = require('../controllers/tours');

const {
  protect,
  restrictedRoutes,
} = require('./../controllers/authController');

Router.route('/monthly-plan/:year').get(getMonthlyPlan);
Router.route('/tour-stats').get(getToursState);
Router.route('/top-5-tour').get(top5Tours, getAllTours); //need to use middleware to get top 5 tours
Router.route('/').get(protect, getAllTours).post(createTour); //middleware to protect the route
// Router.get('/:id', getTour)
//   .patch('/:id', updateTour)
//   .delete('/:id', deleteTour);
Router.route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictedRoutes('lead-guide', 'admin'), deleteTour);
module.exports = Router;
