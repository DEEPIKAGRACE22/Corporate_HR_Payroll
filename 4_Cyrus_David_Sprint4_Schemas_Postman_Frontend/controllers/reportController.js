const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Department = require('../models/Department');

exports.getAttendanceReport = async (req, res, next) => {
  try {
    const departments = await Department.find();
    const result = [];

    for (const dept of departments) {
      const users = await User.find({ departmentId: dept._id });
      const userIds = users.map(u => u._id);
      
      const totalAttendances = await Attendance.countDocuments({ employeeId: { $in: userIds } });
      const presentCount = await Attendance.countDocuments({
        employeeId: { $in: userIds },
        status: { $in: ['Present', 'Late'] }
      });

      const attendancePercentage = totalAttendances > 0 
        ? Math.round((presentCount / totalAttendances) * 100) 
        : 95;

      result.push({
        departmentId: dept._id,
        departmentName: dept.name,
        employeeCount: users.length,
        totalRecords: totalAttendances,
        presentCount,
        attendancePercentage
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department attendance analytics report',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.getPayrollCostReport = async (req, res, next) => {
  try {
    const departments = await Department.find();
    const result = [];

    for (const dept of departments) {
      const users = await User.find({ departmentId: dept._id });
      const userIds = users.map(u => u._id);

      const payrolls = await Payroll.find({ employeeId: { $in: userIds } });
      const totalCost = payrolls.reduce((sum, p) => sum + p.netPay, 0);
      const totalBase = payrolls.reduce((sum, p) => sum + p.baseSalary, 0);

      result.push({
        departmentId: dept._id,
        departmentName: dept.name,
        headCount: users.length,
        totalPayrollDisbursed: totalCost,
        averageSalary: users.length > 0 ? Math.round(totalBase / (payrolls.length || 1)) : 0
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department payroll cost analytics report',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = await Attendance.countDocuments({ date: todayStr, status: { $in: ['Present', 'Late'] } });
    
    const latestPayrolls = await Payroll.find().sort({ year: -1, month: -1 }).limit(10);
    const monthlyDisbursement = latestPayrolls.reduce((sum, p) => sum + p.netPay, 0);

    res.status(200).json({
      success: true,
      message: 'Overall executive HR summary',
      data: {
        totalEmployees,
        totalDepartments,
        presentToday,
        monthlyDisbursement
      }
    });
  } catch (err) {
    next(err);
  }
};
