const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const ToursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide Tour name'],
      unique: true,
      trim: true,
      //validate: [
      //   validator.isAlpha,
      //   'Please provide only alphabets only characters',
      // ],
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
      validate: {
        validator: function (val) {
          //this only points to current doc on new document creation
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) should be less than the original price',
      },
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
    slug: String,
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
      select: false,
    },
    SecretTour: {
      type: Boolean,
      default: false,
    },
    startDates: [Date],
    // createdBy: {
    //   type: mongoose.Types.ObjectId,
    //   ref: 'User',
    //   required: [true, 'Please provide user'],
    // },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
  //  , { timestamps: true }
);

//Virtual populate
ToursSchema.virtual('durationsWeeks').get(function () {
  return this.duration / 7;
});
//document middleware
//happens before saving it to the database
// ToursSchema.pre('save', function (next) {
//   this.priceDiscount = this.price * 0.1; //10% discount
//   next();
// });
ToursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//happens after saving it and before sending it to the database
// ToursSchema.post('save', function (doc, next) {
//   doc.name = this.difficulty;
//   next();
// });
//Query middleware
ToursSchema.pre(/^find/, function (next) {
  this.find({ SecretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
ToursSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});
//Aggregation middleware
ToursSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { SecretTour: { $ne: true } } }); //unshift in the start shift in the end of pipeline
  next();
});

module.exports = mongoose.model('Tours', ToursSchema);
