const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Holiday date is required'],
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Holiday description is required']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Holiday || mongoose.model('Holiday', holidaySchema);
