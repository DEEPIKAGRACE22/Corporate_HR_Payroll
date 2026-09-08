const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required']
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    baseSalary: {
      type: Number,
      required: true
    },
    workingDays: {
      type: Number,
      default: 30
    },
    presentDays: {
      type: Number,
      default: 30
    },
    unpaidLeaveDays: {
      type: Number,
      default: 0
    },
    allowances: {
      hra: { type: Number, default: 0 },
      conveyance: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    deductions: {
      pf: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      unpaidLeaveDeductions: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    netPay: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Generated', 'Paid'],
      default: 'Generated'
    }
  },
  { timestamps: true }
);

// Index as specified in specification
payrollSchema.index({ employeeId: 1 });
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);
