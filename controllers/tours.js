// const fs = require('fs');
// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));
//model of database
const Tours = require('../models/tours');
//create a new tour and save it to db
//async wrapper for error handling
const asyncHandler = require('express-async-handler');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const multer = require('multer'); //uploading images
const sharp = require('sharp'); //to resize the images
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');

const multerStorage = multer.memoryStorage(); //to store the image in memory as buffer
const multerFilter = (req, file, cb) => {
  //to check if the file is an image or not
  if (file.mimetype.startsWith('image')) {
    cb(null, true); //if the file is an image
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false); //if the file is not an image
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
const resizeTourImages = asyncHandler(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next(); //if there is no file, we will not resize it
  //1) cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  //2) images
  req.body.images = []; //to store the images in an array
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename); //push the filename to the array
    })
  );
  next();
});

const top5Tours = asyncHandler(async (req, res, next) => {
  //setting them to hard-coded values
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
});
//get all tours
//@public\
const getAllTours = getAll(Tours); //using the getAll function from handlerFactory.js
// const getAllTours = asyncHandler(async (req, res) => {
//   //execute query
//   const features = new APIFeatures(Tours.find(), req.query)
//     .filter()
//     .sort()
//     .fields()
//     .pagination();
//   const tours = await features.query;

//   res.status(200).json({
//     status: 'success',
//     length: tours.length,
//     data: { tours },
//   });
// });

//desc get single tour
//@public
const getTour = getOne(Tours, {
  path: 'reviews' /*select : '-__V --ChangeAt'*/,
}); //using the getOne function from handlerFactory.js
// const getTour = asyncHandler(async (req, res) => {
//   // const id = Number(req.params.id);
//   // const tour = Tours.findOne({ _id: req.params.id });
//   const tour = await Tours.findById(req.params.id).populate('reviews'); //parent child relationship
//   if (!tour) {
//     return new AppError('Invalid ID', 404);
//   }
//   res.status(200).json({
//     status: 'success',
//     data: tour,
//   });
// });

const createTour = createOne(Tours); //using the createOne function from handlerFactory.js
// const createTour = asyncHandler(async (req, res) => {
//   const tour = await Tours.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: tour,
//   });
// });
//desc update tour
//@public
const updateTour = updateOne(Tours); //using the updateOne function from handlerFactory.js
// const updateTour = asyncHandler(async (req, res) => {
//   const tour = await Tour s.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return new AppError('Invalid ID', 404);
//   }
//   res.status(200).json({
//     status: 'success',
//     data: tour,
//   });
// });

//desc delete tour
//@public
const deleteTour = deleteOne(Tours); //using the deleteOne function from handlerFactory.js
// const deleteTour = asyncHandler(async (req, res) => {
//   const tour = await Tours.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return new AppError('Invalid ID', 404);
//   }
//   res.status(204).json({
//     status: 'success',
//     msg: 'Deleted Successfully',
//   });
// });

const getToursState = asyncHandler(async (req, res) => {
  const stats = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, //get all ratingaverage documents with 4.5 or more
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //null
        numTours: { $sum: 1 }, //get the number of tours
        numRatings: { $sum: '$ratingsQuantity' }, //get the sum of ratings
        avgRating: { $avg: '$ratingsAverage' }, //get the average rating
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, //not equal
    // },
  ]);
  if (!stats) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

const getMonthlyPlan = asyncHandler(async (req, res) => {
  console.log(req.params.year);
  const year = Number(req.params.year);
  const monthlyPlan = await Tours.aggregate([
    {
      $unwind: '$startDates', //deconstruct the array
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), //greater than or equal to
          $lte: new Date(`${year}-12-31`), //less than or equal to
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //group by month
        numTourStarts: { $sum: 1 }, //count the number of tours
        tours: { $push: '$name' }, //push the name of tours
      },
    },
    {
      $addFields: { month: '$_id' }, //add a new field
    },
    {
      $project: { _id: 0 }, //remove the id field
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12, //limit to 12 months
    },
  ]);
  if (!monthlyPlan) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid year number',
    });
  }
  res.status(200).json({
    status: 'success',
    data: monthlyPlan,
  });
});

//Router.route('/tours-within/:distance/center/:latlng/unit/:unit',getToursWithin);
const getToursWithin = asyncHandler(async (req, res) => {
  const { distance, latlng, unit } = req.params; //destructuring
  const [lat, lng] = latlng.split(','); //split the latlng into lat and lng
  if (!lat || !lng) {
    return new AppError(
      'Please provide lat and lng in the format lat,lng',
      400
    );
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //miles or kilometers
  const tours = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: { tours },
  });
});
const getDistance = asyncHandler(async (req, res) => {
  const { latlng, unit } = req.params; //destructuring
  const [lat, lng] = latlng.split(','); //split the latlng into lat and lng
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; //miles or kilometers
  if (!lat || !lng) {
    return new AppError(
      'Please provide lat and lng in the format lat,lng',
      400
    );
  }
  const distances = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], //convert to numbers
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { distances },
  });
});
const getSearchedTours = asyncHandler(async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.length < 2) {
      return res.status(400).json({
        status: 'fail',
        message: 'Search query must be at least 2 characters',
      });
    }

    const tours = await Tours.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name slug summary -_id')
      .limit(5);

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during search',
    });
  }
});

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  top5Tours,
  getToursState,
  getMonthlyPlan,
  getToursWithin,
  getDistance,
  uploadTourImages,
  resizeTourImages,
  getSearchedTours,
};

//desc create new tour
//@public
//old model for reading from a file
// const createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     '../dev-data/data/tours-simple.json',
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: newTour,
//       });
//     }
//   );
// };

//update
// const updateTour = (req, res) => {
//   const id = Number(req.params.id);
//   const tour = tours.find((el) => el.id === id);
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   const updatedTour = Object.assign(tour, req.body);
//   fs.writeFile(
//     '../dev-data/data/tours-simple.json',
//     JSON.stringify(tours),
//     (err) => {
//       res.status(200).json({
//         status: 'success',
//         data: updatedTour,
//       });
//     }
//   );
// };
/*
const deleteTour = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  const index = tours.indexOf(tour);
  tours.splice(index, 1);
  fs.writeFile(
    '../dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};

*/
//old way without classes
//filtering
// const queryObj = { ...req.query }; //to make a new copy not affecting the query object
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]); //removefrom queryObj the unwanted fields

// //advanced filtering
// let querySTR = JSON.stringify(queryObj); //convert to string
// querySTR = querySTR.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //\b to make it exact /g for replacing all

// // console.log(JSON.parse(querySTR)); //convert back to json object
// let query = Tours.find(JSON.parse(querySTR));
//sorting order
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }
// field limitation query
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v'); //remove the __v field
// }
//pagination
// const page = req.query.page * 1 || 1; //default value 1
// const limit = req.query.limit * 1 || 100; //default value 100
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit);
// if (req.query.page) {
//   const numTours = await Tours.countDocuments(); //count the number of documents
//   if (skip >= numTours) {
//     throw new Error('This page does not exist');
//   }
// }
