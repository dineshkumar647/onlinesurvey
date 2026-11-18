const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  type: { type: String, enum: ['multiple-choice', 'short-answer'], required: true },
  options: [{ type: String }],
  category: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
