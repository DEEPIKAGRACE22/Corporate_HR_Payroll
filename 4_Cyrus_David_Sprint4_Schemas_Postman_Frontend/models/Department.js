const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true
    },
    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);
