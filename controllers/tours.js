// const fs = require('fs');
// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));
//model of database
const Tours = require('../models/tours');
//create a new tour and save it to db
//async wrapper for error handling
const asyncHandler = require('express-async-handler');

//get all tours
//@public
const getAllTours = asyncHandler(async (req, res) => {
  const queryObj = req.query;
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]); //removefrom queryObj the unwanted fields
  let querySTR = JSON.stringify(queryObj); //convert to string
  querySTR = querySTR.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //\b to make it exact /g for replacing all

  // console.log(JSON.parse(querySTR)); //convert back to json object
  const query = Tours.find(JSON.parse(querySTR));

  //so we can do the sorting limiting pagination
  const tours = await query;
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

module.exports = { getAllTours, getTour, createTour, updateTour, deleteTour };

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
