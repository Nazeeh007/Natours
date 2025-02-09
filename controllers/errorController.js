const AppError = require('./../utils/appError');
const handelCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handelValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const pattern = /name: "([^"]+)"/;
  const value = err.errorResponse.errmsg.match(pattern);
  const message = `Duplicate field value: ${value} Please use another value!`;
  return new AppError(message, 400);
};
const handleJsonWebTokenError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};
const handleTokenExpiredError = () => {
  return new AppError('Your token has expired! Please log in again', 401);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //a error created by AppError
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //programming or other unknown error
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(Object.getPrototypeOf(err)); // Preserve prototype
    Object.assign(error, err); // Copy own properties
    console.log(error.name);
    if (error.name === 'CastError') {
      error = handelCastError(error);
    } else if (error.name === 'ValidationError') {
      error = handelValidationError(error);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    } else if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError();
    } else if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }

    sendErrorProd(error, res);
  }
};
module.exports = globalErrorHandler;
