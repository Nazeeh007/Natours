const Tour = require('../models/tours');
const User = require('../models/users');
const asyncHandler = require('express-async-handler');
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
