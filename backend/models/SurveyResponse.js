const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  questionText: { type: String, required: true },
  answer: { type: String, required: true, trim: true }
}, { _id: false });

const responseSchema = new mongoose.Schema({
  respondentName: { type: String, trim: true, default: 'Anonymous' },
  answers: {
    type: [answerSchema],
    validate: {
      validator: value => value.length === 5,
      message: 'A survey response must contain exactly 5 answers.'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('SurveyResponse', responseSchema);
