const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required']
    },
    type: {
      type: String,
      enum: ['casual', 'sick', 'earned'],
      required: [true, 'Leave type is required']
    },
    fromDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'From date is required']
    },
    toDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'To date is required']
    },
    totalDays: {
      type: Number,
      default: 1
    },
    reason: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Index as specified in specification
leaveRequestSchema.index({ employeeId: 1 });
leaveRequestSchema.index({ status: 1 });

module.exports = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);
