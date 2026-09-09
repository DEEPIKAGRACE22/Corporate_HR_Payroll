const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { computeSalary } = require('../utils/calculator');

exports.runPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const targetMonth = month ? Number(month) : (new Date().getMonth() + 1);
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const employees = await User.find({ role: { $in: ['Employee', 'Manager'] } });
    const records = [];

    const monthStr = String(targetMonth).padStart(2, '0');
    const datePrefix = `${targetYear}-${monthStr}`;

    for (const emp of employees) {
      const attendance = await Attendance.find({
        employeeId: emp._id,
        date: { $regex: `^${datePrefix}` }
      });

      const presentCount = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const halfDays = attendance.filter(a => a.status === 'Half-Day').length;
      const effectivePresent = presentCount + (halfDays * 0.5);

      const workingDays = 30;
      const unpaidLeaves = Math.max(0, 4 - (effectivePresent > 0 ? effectivePresent : 26) > 0 ? 1 : 0);

      const calculation = computeSalary({
        baseSalary: emp.baseSalary || 50000,
        totalDaysInMonth: workingDays,
        presentDays: effectivePresent > 0 ? effectivePresent : 26,
        unpaidLeaves
      });

      const payrollRecord = await Payroll.findOneAndUpdate(
        { employeeId: emp._id, month: targetMonth, year: targetYear },
        {
          employeeId: emp._id,
          month: targetMonth,
          year: targetYear,
          baseSalary: calculation.baseSalary,
          workingDays: calculation.workingDays,
          presentDays: calculation.presentDays,
          unpaidLeaveDays: calculation.unpaidLeaveDays,
          allowances: calculation.allowances,
          deductions: calculation.deductions,
          netPay: calculation.netPay,
          status: 'Generated'
        },
        { upsert: true, new: true }
      );

      records.push(payrollRecord);
    }

    res.status(201).json({
      success: true,
      message: `Payroll computed successfully for ${records.length} employees for ${targetMonth}/${targetYear}`,
      data: {
        processedCount: records.length,
        month: targetMonth,
        year: targetYear,
        totalDisbursed: records.reduce((acc, curr) => acc + curr.netPay, 0)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getEmployeePayslips = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    if (req.user.role === 'Employee' && req.user._id.toString() !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own payslips.',
        errorCode: 'FORBIDDEN'
      });
    }

    const payslips = await Payroll.find({ employeeId })
      .populate('employeeId', 'name email designation departmentId baseSalary')
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      message: 'Payslips retrieved successfully',
      data: payslips
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const payslip = await Payroll.findById(req.params.id)
      .populate('employeeId', 'name email designation departmentId');
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
        errorCode: 'NOT_FOUND'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Payslip retrieved successfully',
      data: payslip
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllRecords = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.month) filter.month = Number(req.query.month);
    if (req.query.year) filter.year = Number(req.query.year);

    const records = await Payroll.find(filter)
      .populate('employeeId', 'name email designation departmentId')
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      message: 'All payroll records retrieved',
      data: records
    });
  } catch (err) {
    next(err);
  }
};
