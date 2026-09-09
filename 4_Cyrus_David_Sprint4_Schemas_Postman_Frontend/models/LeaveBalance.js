const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
      unique: true
    },
    casual: {
      type: Number,
      default: 10,
      min: 0
    },
    sick: {
      type: Number,
      default: 10,
      min: 0
    },
    earned: {
      type: Number,
      default: 15,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', leaveBalanceSchema);
