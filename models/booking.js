const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price!'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});
//populate the user and tour fields with the name of the tour and user respectively
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' }); //populate the tour field with the name of the tour
});

module.exports = mongoose.model('Booking', bookingSchema);
