const Attendance = require('../models/Attendance');

exports.clockIn = async (req, res, next) => {
  try {
    const employeeId = req.body.employeeId || (req.user ? req.user._id : null);
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const todayStr = req.body.date 
      ? (typeof req.body.date === 'string' && req.body.date.includes('T') ? req.body.date.split('T')[0] : req.body.date)
      : new Date().toISOString().split('T')[0];

    const existing = await Attendance.findOne({ employeeId, date: todayStr });
    if (existing && existing.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: Employee has already clocked in for this date',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const currentTime = req.body.clockIn || new Date().toTimeString().split(' ')[0];
    
    let status = req.body.status || 'Present';
    if (!req.body.status) {
      const [hours, mins] = currentTime.split(':').map(Number);
      if (hours > 9 || (hours === 9 && mins > 30)) {
        status = 'Late';
      }
    }

    let record;
    if (existing) {
      existing.clockIn = currentTime;
      existing.status = status;
      record = await existing.save();
    } else {
      record = await Attendance.create({
        employeeId,
        date: todayStr,
        clockIn: currentTime,
        status
      });
    }

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: {
        _id: record._id
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.clockOut = async (req, res, next) => {
  try {
    const employeeId = req.body.employeeId || (req.user ? req.user._id : null);
    const todayStr = req.body.date || new Date().toISOString().split('T')[0];

    const record = await Attendance.findOne({ employeeId, date: todayStr });
    if (!record || !record.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: No clock-in record found for today to clock out from',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    if (record.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: Employee has already clocked out today',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const clockOutTime = req.body.clockOut || new Date().toTimeString().split(' ')[0];
    record.clockOut = clockOutTime;

    try {
      const [inH, inM] = record.clockIn.split(':').map(Number);
      const [outH, outM] = clockOutTime.split(':').map(Number);
      const durationHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
      record.totalHours = durationHours > 0 ? parseFloat(durationHours.toFixed(2)) : 0;
      if (record.totalHours < 4) {
        record.status = 'Half-Day';
      }
    } catch (e) {
      record.totalHours = 8;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Clock-out recorded successfully',
      data: record
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ employeeId: req.user._id }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved',
      data: records
    });
  } catch (err) {
    next(err);
  }
};

exports.getTodayStatus = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ employeeId: req.user._id, date: todayStr });
    res.status(200).json({
      success: true,
      message: "Today's attendance status",
      data: record || null
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;

    const records = await Attendance.find(filter)
      .populate('employeeId', 'name email designation departmentId')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: 'All attendance records retrieved',
      data: records
    });
  } catch (err) {
    next(err);
  }
};
