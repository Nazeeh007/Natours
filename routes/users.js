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
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/users');
const {
  signUp,
  login,
  forgetPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictedRoutes,
  logout,
} = require('../controllers/authController');
// Router.param('id', checkID);
//authenticationController
Router.route('/signup').post(signUp);
Router.route('/login').post(login);
Router.route('/logout').get(logout);
Router.route('/forgetPassword').post(forgetPassword);
Router.route('/resetPassword/:token').patch(resetPassword);
//protect all routes after this line
Router.use(protect);
//updatePasswordController
Router.route('/updatePassword').patch(updatePassword); //protected route as we must login first
//userUpdateController
Router.route('/updateMe').patch(uploadUserPhoto, resizeUserPhoto, updateMe);
Router.route('/deleteMe').delete(deleteMe);
Router.route('/me').get(getMe, getUser); //get the user from the token

Router.use(restrictedRoutes('admin')); //only admin can access the routes below
//userController
Router.route('/').get(getAllUsers).post(createUser);
Router.get('/:id', getUser)
  .patch('/:id', updateUser)
  .delete('/:id', deleteUser);
module.exports = Router;
