const asyncHandler = require('express-async-handler');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');

const deleteOne = (Model) => {
  return asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return new AppError('Invalid ID', 404);
    }
    res.status(204).json({
      status: 'success',
      msg: 'Deleted Successfully',
    });
  });
};
const updateOne = (Model) => {
  return asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return new AppError('Invalid ID', 404);
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};
const createOne = (Model) => {
  return asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });
};
const getOne = (Model, popOptions) => {
  return asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;
    if (!doc) {
      return new AppError('Invalid ID', 404);
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};
const getAll = (Model) => {
  return asyncHandler(async (req, res) => {
    //to allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    const doc = await features.query;
    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      length: doc.length,
      data: { doc },
    });
  });
};

module.exports = {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
};
