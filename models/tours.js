const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = reqiure('./users.js');
const ToursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide Tour name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
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
      max: [5, 'Rating must be below 5.0'],
      min: [1, 'Rating must be above 1.0'],
      set: (val) => Math.round(val * 10) / 10, //4.6667 = 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'hard', 'difficult'],
        message: 'Difficulty must be either: easy, medium, hard, or difficult', // Custom error message
      },
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
    images: [String],
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
    //GeoJSON
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //lat,lon array of numbers
      address: String,
      description: String,
    },
    locations: [
      //embedded objects
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      //reference to user model child reference
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
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
//Indexes
ToursSchema.index({ price: 1, ratingsAverage: -1 }); //compound index
ToursSchema.index({ slug: 1 }); //single index
ToursSchema.index({ startLocation: '2dsphere' }); //geospatial index
//Virtual populate
ToursSchema.virtual('durationsWeeks').get(function () {
  return this.duration / 7;
});
//Virtual populate
//parent child relationship
ToursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //foreign key(where the id is stored)
  localField: '_id', //local key
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
//embedded documents (got the data of each tour guider but the bad in this that each time guide change anything in his data we should loop on
// all the tours and update it)
//guides = [
// {
//  name: 'John Doe',
//  age: 30,},
// {
// name: 'Jane Doe',
// age: 25,
// },
//]
// ToursSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); //await return Promise so we need to deal with promise
//   this.guides = await Promise.all(guidesPromises); //we use promise.all here because we have multiple promises
//   next();
// });

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
//populate query middleware for guides
ToursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
ToursSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});
//Aggregation middleware
// ToursSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { SecretTour: { $ne: true } } }); //unshift in the start shift in the end of pipeline
//   next();
// });

module.exports = mongoose.model('Tours', ToursSchema);
