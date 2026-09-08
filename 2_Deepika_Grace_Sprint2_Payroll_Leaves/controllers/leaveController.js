const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');

exports.apply = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const { type, fromDate, toDate, reason } = req.body;

    if (!type || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, fromDate, and toDate are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: fromDate cannot be after toDate',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const overlap = await LeaveRequest.findOne({
      employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
      ]
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: An overlapping leave request already exists for these dates',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    let balance = await LeaveBalance.findOne({ employeeId });
    if (!balance) {
      balance = await LeaveBalance.create({ employeeId, casual: 10, sick: 10, earned: 15 });
    }

    if (balance[type] < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. You have ${balance[type]} ${type} leave days available, but requested ${totalDays} days.`,
        errorCode: 'INSUFFICIENT_BALANCE'
      });
    }

    const leave = await LeaveRequest.create({
      employeeId,
      type,
      fromDate,
      toDate,
      totalDays,
      reason: reason || '',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

exports.decision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Approved or Rejected',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
        errorCode: 'NOT_FOUND'
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leave.status.toLowerCase()}`,
        errorCode: 'VALIDATION_ERROR'
      });
    }

    leave.status = status;
    leave.remarks = remarks || (status === 'Approved' ? 'Reviewed and confirmed by authorized role' : 'Rejected');
    leave.approverId = req.user._id;
    await leave.save();

    if (status === 'Approved') {
      const balance = await LeaveBalance.findOne({ employeeId: leave.employeeId });
      if (balance && balance[leave.type] !== undefined) {
        balance[leave.type] = Math.max(0, balance[leave.type] - leave.totalDays);
        await balance.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: {
        _id: leave._id,
        status: leave.status,
        remarks: leave.remarks
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ employeeId: req.user._id })
      .populate('approverId', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'My leave requests retrieved',
      data: leaves
    });
  } catch (err) {
    next(err);
  }
};

exports.getPendingLeaves = async (req, res, next) => {
  try {
    let filter = { status: 'Pending' };
    
    if (req.user.role === 'Manager') {
      const User = require('../models/User');
      const team = await User.find({ managerId: req.user._id }).select('_id');
      const teamIds = team.map(t => t._id);
      filter.employeeId = { $in: teamIds };
    }

    const leaves = await LeaveRequest.find(filter)
      .populate('employeeId', 'name email designation departmentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Pending leaves retrieved',
      data: leaves
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyBalances = async (req, res, next) => {
  try {
    let balance = await LeaveBalance.findOne({ employeeId: req.user._id });
    if (!balance) {
      balance = await LeaveBalance.create({ employeeId: req.user._id, casual: 10, sick: 10, earned: 15 });
    }
    res.status(200).json({
      success: true,
      message: 'Leave balances retrieved',
      data: balance
    });
  } catch (err) {
    next(err);
  }
};

exports.getEmployeeBalances = async (req, res, next) => {
  try {
    let balance = await LeaveBalance.findOne({ employeeId: req.params.employeeId });
    if (!balance) {
      balance = await LeaveBalance.create({ employeeId: req.params.employeeId, casual: 10, sick: 10, earned: 15 });
    }
    res.status(200).json({
      success: true,
      message: 'Employee leave balances retrieved',
      data: balance
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBalance = async (req, res, next) => {
  try {
    const { casual, sick, earned } = req.body;
    let balance = await LeaveBalance.findOne({ employeeId: req.params.employeeId });
    if (!balance) {
      balance = new LeaveBalance({ employeeId: req.params.employeeId });
    }
    if (casual !== undefined) balance.casual = casual;
    if (sick !== undefined) balance.sick = sick;
    if (earned !== undefined) balance.earned = earned;
    await balance.save();

    res.status(200).json({
      success: true,
      message: 'Leave balance updated successfully',
      data: balance
    });
  } catch (err) {
    next(err);
  }
};
