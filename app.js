require('dotenv').config();
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmets = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});
const express = require('express');
const app = express();

const morgan = require('morgan');
//GLOBAL middleware
//helmet
//set security HTTP headers
app.use(helmets());

app.use(cookieParser());
// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });
//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//rate limiting from same API
const limiter = rateLimit({
  max: 100, //100 request from the same ip
  windowMs: 60 * 60 * 1000, //1hour
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //set views directory
app.use('/api', limiter); //any route start with /api
//body parser reading data from body into req.body
app.use(express.json());
//Data Sanitization against NoSQL query injection
app.use(mongoSanitize()); //remove all dollar signs and dots from the req.body, req.query, req.params
//Data Sanitization against XSS
app.use(xss()); //remove all malicious html code from the req.body, req.query, req.params
//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      //allow parameter duplication
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//serving static files
app.use(express.static('./public'));
const getTime = require('./middleware/getTime');
//routes
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRoutes = require('./routes/tours');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviewsRoutes');
const viewRoutes = require('./routes/viewRouters');

//db
const connectDB = require('./db/connect');

//Routers
app.use('/', getTime, viewRoutes);
app.use('/api/v1/tours', getTime, tourRoutes);
app.use('/api/v1/users', getTime, userRoutes);
app.use('/api/v1/reviews', getTime, reviewRoutes);
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
    const server = app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error.name, error.message);
  }
};
/**
 * process.on('unhandledRejection', (err) => {
      console.log(err.name, err.message);
      console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      server.close(() => {
        process.exit(1);
      });
    });
  });
 */
//MongoServerError bad auth : authentication failed
process.on('unhandledRejection', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
//ReferenceError x is not defined

start();
