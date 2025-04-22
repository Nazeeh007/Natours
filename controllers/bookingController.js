const asyncHandler = require('express-async-handler');
const AppError = require('./../utils/appError');
const Tours = require('../models/tours');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); //import stripe and pass the secret key
const Booking = require('../models/booking');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');
const getCheckoutSession = asyncHandler(async (req, res, next) => {
  const tour = await Tours.findById(req.params.tourId); //find the tour by id
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404)); //if no tour found, return error
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    //not save as if someone know the url, they can access the session
    success_url: `${req.protocol}://${req.get('host')}/?&tour=${
      req.params.tourId
    }&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://www.natours.dev/img/tours/${tour.imageCover}`,
              //`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});
const createBookingCheckoutSession = asyncHandler(async (req, res, next) => {
  // This is temporary, because it's not secure. We should use webhooks to create a booking
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });
  //re direct to the original url without query params
  res.redirect(req.originalUrl.split('?')[0]);
});
const createBooking = createOne(Booking);
const getBooking = getOne(Booking);
const getAllBookings = getAll(Booking);
const updateBooking = updateOne(Booking);
const deleteBooking = deleteOne(Booking);

module.exports = {
  getCheckoutSession,
  createBookingCheckoutSession,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
};
