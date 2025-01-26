const fs = require('fs');
const tours = JSON.parse(fs.readFileSync('./dev-data/data/users.json'));

//get all users
//@public
const getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    createdAT: req.requestTime,
    length: tours.length,
    data: tours,
  });
  console.log(req.requestTime);
};

//desc get single user
//@public
const getUser = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id);
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
};

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
const updateUser = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  const updatedTour = Object.assign(tour, req.body);
  fs.writeFile(
    '../dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: updatedTour,
      });
    }
  );
};

//desc delete user
//@public
const deleteUser = (req, res) => {
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
};
