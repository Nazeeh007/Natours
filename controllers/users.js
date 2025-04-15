const fs = require('fs');
const tours = JSON.parse(fs.readFileSync('./dev-data/data/users.json'));
const User = require('./../models/users');
const asyncHandler = require('express-async-handler');
const AppError = require('./../utils/appError');
const multer = require('multer'); //uploading images
const sharp = require('sharp'); //to resize the images
const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require('./../controllers/handlerFactory');
// stored in disk storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); //where to store the image
//   },
//   filename: (req, file, cb) => {
//     //to create a unique name for the image
//     const ext = file.mimetype.split('/')[1]; //to get the extension of the image
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); //to create a unique name for the image
//   },
// });
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

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); //if there is no file, we will not resize it
  //1) create a unique name for the image
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  //2) resize the image
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
}); //to resize the image
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//@private
const updateMe = asyncHandler(async (req, res, next) => {
  // console.log(req.file); //to see the uploaded file
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
  if (req.file) {
    filteredBody.photo = req.file.filename; //to save the image name in the database
  }
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
  uploadUserPhoto,
  resizeUserPhoto,
};
