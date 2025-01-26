const express = require('express');
const Router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  // checkID,
} = require('../controllers/users');
// Router.param('id', checkID);

Router.route('/').get(getAllUsers).post(createUser);
Router.get('/:id', getUser)
  .patch('/:id', updateUser)
  .delete('/:id', deleteUser);

module.exports = Router;
