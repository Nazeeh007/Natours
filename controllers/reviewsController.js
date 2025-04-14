const Review = require('./../models/reviews');
// const asyncHandler = require('express-async-handler');
const AppError = require('./../utils/appError');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');

const getAllReviews = getAll(Review); //using the getAll function from handlerFactory
// const getAllReviews = asyncHandler(async (req, res) => {
//   let filter = {};
//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId };
//   }
//   const reviews = await Review.find(filter);
//   res.status(200).json({
//     status: 'success',
//     length: reviews.length,
//     data: { reviews },
//   });
// });

const getReview = getOne(Review); //using the getOne function from handlerFactory
// const getReview = asyncHandler(async (req, res) => {
//   const review = await Review.findById(req.params.id);
//   if (!review) {
//     return new AppError('Invalid ID', 404);
//   }
//   res.status(200).json({
//     status: 'success',
//     data: review,
//   });
// });
const setTourUserIds = (req, res, next) => {
  //middleware function since it is not in the generic createo factoryhandler
  //nested routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

const createReview = createOne(Review); //using the createOne function from handlerFactory
// const createReview = asyncHandler(async (req, res) => {
//   //nested routes
//   if (!req.body.tour) {
//     req.body.tour = req.params.tourId;
//   }
//   if (!req.body.user) {
//     req.body.user = req.user.id;
//   }
//   const review = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: review,
//   });
// });
const updateReview = updateOne(Review); //using the updateOne function from handlerFactory
// const updateReview = asyncHandler(async (req, res) => {
//   const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!review) {
//     return new AppError('Invalid ID', 404);
//   }
//   res.status(200).json({
//     status: 'success',
//     data: review,
//   });
// });
const deleteReview = deleteOne(Review); //using the deleteOne function from handlerFactory
module.exports = {
  setTourUserIds,
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
