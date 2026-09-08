const Holiday = require('../models/Holiday');

exports.getAll = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      message: 'Holidays retrieved',
      data: holidays
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { date, description } = req.body;
    if (!date || !description) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: Date and description are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const holiday = await Holiday.create({ date, description });
    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday
    });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
        errorCode: 'NOT_FOUND'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
