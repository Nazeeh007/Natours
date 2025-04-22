const Tour = require('../models/tours');
const User = require('../models/users');
const Booking = require('../models/booking');
const Review = require('../models/reviews');
const asyncHandler = require('express-async-handler');
const AppError = require('./../utils/appError');

exports.getOverview = asyncHandler(async (req, res, next) => {
  //1) Get tour data from collection
  const tours = await Tour.find();
  //2) Build template
  //3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours, //send data to overview pug template
  });
});
exports.getTour = asyncHandler(async (req, res, next) => {
  //1) Get the data for the requested tour (including reviews and guides)
  //2) Build template
  //3) Render template using data from 1)
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  //   console.log(tour);
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour,
  });
});
exports.getLogin = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'Log into your account',
    });
};

exports.getSignup = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup',
    message: 'Welcome to the signup page',
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};
exports.updateUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
exports.getMyTours = asyncHandler(async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  //2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
  });
  // console.log(reviews);
  res.status(200).render('reviews', {
    title: 'My Reviews',
    reviews,
  });
});
