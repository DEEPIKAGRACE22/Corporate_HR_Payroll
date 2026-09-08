const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');

exports.getTeamMembers = async (req, res, next) => {
  try {
    const team = await User.find({ managerId: req.user._id })
      .select('-passwordHash')
      .populate('departmentId', 'name');
    res.status(200).json({
      success: true,
      message: 'Team members retrieved',
      data: team
    });
  } catch (err) {
    next(err);
  }
};

exports.getTeamAttendanceToday = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const team = await User.find({ managerId: req.user._id }).select('_id name email designation');
    const teamIds = team.map(t => t._id);

    const attendances = await Attendance.find({
      employeeId: { $in: teamIds },
      date: todayStr
    });

    const attendanceMap = new Map();
    attendances.forEach(a => attendanceMap.set(a.employeeId.toString(), a));

    const result = team.map(member => ({
      member,
      attendance: attendanceMap.get(member._id.toString()) || { status: 'Not Clocked In' }
    }));

    res.status(200).json({
      success: true,
      message: "Today's team attendance status",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.getTeamLeaves = async (req, res, next) => {
  try {
    const team = await User.find({ managerId: req.user._id }).select('_id');
    const teamIds = team.map(t => t._id);

    const leaves = await LeaveRequest.find({ employeeId: { $in: teamIds } })
      .populate('employeeId', 'name email designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Team leave requests retrieved',
      data: leaves
    });
  } catch (err) {
    next(err);
  }
};
