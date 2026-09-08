const PerformanceNote = require('../models/PerformanceNote');

exports.logNote = async (req, res, next) => {
  try {
    const { employeeId, note, rating } = req.body;
    if (!employeeId || !note) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: employeeId and note are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const perf = await PerformanceNote.create({
      employeeId,
      managerId: req.user._id,
      note,
      rating: rating || 5,
      date: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: 'Performance note logged successfully',
      data: perf
    });
  } catch (err) {
    next(err);
  }
};

exports.getByEmployee = async (req, res, next) => {
  try {
    const notes = await PerformanceNote.find({ employeeId: req.params.employeeId })
      .populate('managerId', 'name designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Performance notes retrieved',
      data: notes
    });
  } catch (err) {
    next(err);
  }
};
