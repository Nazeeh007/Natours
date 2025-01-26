const express = require('express');
const Router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tours');

Router.route('/').get(getAllTours).post(createTour);
// Router.get('/:id', getTour)
//   .patch('/:id', updateTour)
//   .delete('/:id', deleteTour);
Router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
module.exports = Router;
