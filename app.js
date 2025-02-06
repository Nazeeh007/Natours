require('dotenv').config();

const express = require('express');
const app = express();
const morgan = require('morgan');
//middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static('./public'));
const getTime = require('./middleware/getTime');
//routes
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRoutes = require('./routes/tours');
const userRoutes = require('./routes/users');

//db
const connectDB = require('./db/connect');
//Routers
app.use('/api/v1/tours', getTime, tourRoutes);
app.use('/api/v1/users', getTime, userRoutes);
//(*)use for all vers get/patch/delete/post routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
//Global Error Handler
app.use(globalErrorHandler);

//port
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    const connect = await connectDB(process.env.MONGO_URI);
    console.log(`Connected to DB : ${connect.connections[0].name}`);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
