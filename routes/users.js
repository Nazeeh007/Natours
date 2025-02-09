const express = require('express');
const Router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  // checkID,
  updateMe,
  deleteMe,
} = require('../controllers/users');
const {
  signUp,
  login,
  forgetPassword,
  resetPassword,
  protect,
  updatePassword,
} = require('../controllers/authController');
// Router.param('id', checkID);
//authenticationController
Router.route('/signup').post(signUp);
Router.route('/login').post(login);
Router.route('/forgetPassword').post(forgetPassword);
Router.route('/resetPassword/:token').patch(resetPassword);
Router.route('/updatePassword').patch(protect, updatePassword); //protected route as we must login first
//userUpdateController
Router.route('/updateMe').patch(protect, updateMe);
Router.route('/deleteMe').delete(protect, deleteMe);
//userController
Router.route('/').get(getAllUsers).post(createUser);
Router.get('/:id', getUser)
  .patch('/:id', updateUser)
  .delete('/:id', deleteUser);

module.exports = Router;
