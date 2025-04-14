const fs = require('fs');
const tours = JSON.parse(fs.readFileSync('./dev-data/data/users.json'));
const User = require('./../models/users');
const asyncHandler = require('express-async-handler');
const AppError = require('./../utils/appError');
const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//@private
const updateMe = asyncHandler(async (req, res, next) => {
  //1) create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400
      )
    );
  }
  //2) filtered out unwanted fields names that are not allowed to be updated by the user
  //we have the user as we ran the protect middleware before using this route
  const filteredBody = filterObj(req.body, 'name', 'email'); //to not make user update his role
  //3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    //we are not updating the password so we can use findyidandupdate
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//@private
const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//get all users
//@public
const getAllUsers = getAll(User); //using the getAll function from handlerFactory.js
// const getAllUsers = asyncHandler(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     length: users.length,
//     data: { users },
//   });
// });

const getMe = (req, res, next) => {
  req.params.id = req.user.id; //to get the current logged in user
  next();
};
//desc get single user
//@public
const getUser = getOne(User); //using the getOne function from handlerFactory

//desc create new user
//@public
const createUser = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    '../dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: newTour,
      });
    }
  );
};

//desc update user
//@public
const updateUser = updateOne(User); //using the updateOne function from handlerFactory
// const updateUser = (req, res) => {
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

//desc delete user
//@public

const deleteUser = deleteOne(User); //using the deleteOne function from handlerFactory
// const checkID = (req, res, next, val) => {
//   const id = Number(req.params.id);
//   console.log("the id is : " + id);
//   const tour = tours.find((el) => el.id === id);
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };
module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  // checkID,
  updateMe,
  deleteMe,
  getMe,
};
