const Department = require('../models/Department');

exports.getAll = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('headId', 'name email designation');
    res.status(200).json({
      success: true,
      message: 'Departments retrieved successfully',
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('headId', 'name email designation');
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
        errorCode: 'NOT_FOUND'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Department retrieved successfully',
      data: department
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, headId, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const dept = await Department.create({ name, headId: headId || null, description: description || '' });
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: dept
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, headId, description } = req.body;
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { name, headId: headId || null, description },
      { new: true, runValidators: true }
    );
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
        errorCode: 'NOT_FOUND'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: dept
    });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
        errorCode: 'NOT_FOUND'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
