const Tour = require('./../../models/tours');
const User = require('./../../models/users');
const Review = require('./../../models/reviews');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./../../db/connect');

// mongoose.set('bufferTimeoutMS', 60000); // 30 seconds
const connect = connectDB(process.env.MONGO_URI);

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, {
      validateBeforeSave: false,
    });
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};
// console.log(process.argv[2]);

if (process.argv[2] === '--import') {
  console.log('Importing...');
  importData();
} else if (process.argv[2] === '--delete') {
  console.log('Deleting...');
  deleteData();
}
