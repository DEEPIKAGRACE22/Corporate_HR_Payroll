const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required']
    },
    date: {
      type: String, // Format: YYYY-MM-DD for accurate day queries
      required: [true, 'Date is required']
    },
    clockIn: {
      type: String,
      default: null
    },
    clockOut: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-Day', 'Absent', 'On Leave'],
      default: 'Present'
    },
    totalHours: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index as specified in specification
attendanceSchema.index({ employeeId: 1 });
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
