// const fs = require('fs');
// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));
//model of database
const Tours = require('../models/tours');
//create a new tour and save it to db
//async wrapper for error handling
const asyncHandler = require('express-async-handler');
class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //Tours.find()
    this.queryString = queryString; //req.query
  }

  filter() {
    const queryObj = { ...this.queryString }; //to make a new copy not affecting the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]); //removefrom queryObj the unwanted fields

    //advanced filtering
    let querySTR = JSON.stringify(queryObj); //convert to string
    querySTR = querySTR.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //\b to make it exact /g for replacing all

    // console.log(JSON.parse(querySTR)); //convert back to json object
    this.query = this.query.find(JSON.parse(querySTR));
    return this; //the entire query object
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //remove the __v field
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1; //default value 1
    const limit = this.queryString.limit * 1 || 100; //default value 100
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    //not necessary
    // if (this.queryStringpage) {
    //   const numTours = await Tours.countDocuments(); //count the number of documents
    //   if (skip >= numTours) {
    //     throw new Error('This page does not exist');
    //   }
    // }
    return this;
  }
}
const top5Tours = asyncHandler(async (req, res, next) => {
  //setting them to hard-coded values
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
});
//get all tours
//@public
const getAllTours = asyncHandler(async (req, res) => {
  //execute query
  const features = new APIFeatures(Tours.find(), req.query)
    .filter()
    .sort()
    .fields()
    .pagination();
  const tours = await features.query;

  if (!tours) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: tours,
  });
});

//desc get single tour
//@public
const getTour = asyncHandler(async (req, res) => {
  // const id = Number(req.params.id);
  // const tour = Tours.findOne({ _id: req.params.id });
  console.log(req.params.id);
  const tour = await Tours.findById(req.params.id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

const createTour = asyncHandler(async (req, res) => {
  const tour = await Tours.create(req.body);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(201).json({
    status: 'success',
    data: tour,
  });
});
//desc update tour
//@public
const updateTour = asyncHandler(async (req, res) => {
  const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

//desc delete tour
//@public
const deleteTour = asyncHandler(async (req, res) => {
  const tour = await Tours.findByIdAndDelete(req.params.id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    msg: 'Deleted Successfully',
  });
});

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  top5Tours,
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
