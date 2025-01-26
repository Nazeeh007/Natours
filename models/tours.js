const mongoose = require('mongoose');

const ToursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide Tour name'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide price '],
    },
    priceDiscount: {
      type: Number,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'difficult'],
      default: 'easy',
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Please provide a group  number'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Please provide a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Please provide a cover image'],
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    // createdBy: {
    //   type: mongoose.Types.ObjectId,
    //   ref: 'User',
    //   required: [true, 'Please provide user'],
    // },
  }
  //  , { timestamps: true }
);

module.exports = mongoose.model('Tours', ToursSchema);
