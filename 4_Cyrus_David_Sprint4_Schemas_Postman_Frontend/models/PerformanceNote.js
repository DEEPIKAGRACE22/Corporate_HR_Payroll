const mongoose = require('mongoose');

const performanceNoteSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required']
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Manager ID is required']
    },
    note: {
      type: String,
      required: [true, 'Performance note is required']
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  },
  { timestamps: true }
);

performanceNoteSchema.index({ employeeId: 1 });

module.exports = mongoose.models.PerformanceNote || mongoose.model('PerformanceNote', performanceNoteSchema);
