const express = require('express');
const Router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  top5Tours,
} = require('../controllers/tours');
Router.route('/top-5-tour').get(top5Tours, getAllTours); //need to use middleware to get top 5 tours
Router.route('/').get(getAllTours).post(createTour);
// Router.get('/:id', getTour)
//   .patch('/:id', updateTour)
//   .delete('/:id', deleteTour);
Router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
module.exports = Router;
