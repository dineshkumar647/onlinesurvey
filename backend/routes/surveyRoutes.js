const express = require('express');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const SurveyResponse = require('../models/SurveyResponse');

const router = express.Router();

// Return exactly five randomly selected questions.
router.get('/questions/random', async (req, res, next) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 5 } }]);
    if (questions.length < 5) {
      return res.status(503).json({ message: 'At least 5 questions are required. Please add more questions.' });
    }
    res.json(questions);
  } catch (error) { next(error); }
});

// Submit answers for the five displayed questions.
router.post('/responses', async (req, res, next) => {
  try {
    const { respondentName, answers } = req.body;
    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({ message: 'Please submit answers to exactly 5 questions.' });
    }

    const normalized = [];
    for (const item of answers) {
      if (!item.questionId || !mongoose.Types.ObjectId.isValid(item.questionId) ||
          typeof item.answer !== 'string' || !item.answer.trim()) {
        return res.status(400).json({ message: 'Every question must have a valid answer.' });
      }
      const question = await Question.findById(item.questionId);
      if (!question) return res.status(400).json({ message: 'A submitted question could not be found. Please reload the survey.' });

      const answer = item.answer.trim();
      if (question.type === 'multiple-choice' && !question.options.includes(answer)) {
        return res.status(400).json({ message: 'Please select one of the available options.' });
      }
      normalized.push({ questionId: question._id, questionText: question.text, answer });
    }

    const response = await SurveyResponse.create({
      respondentName: (respondentName || 'Anonymous').trim().slice(0, 80) || 'Anonymous',
      answers: normalized
    });
    res.status(201).json({ message: 'Your survey response has been submitted successfully!', responseId: response._id });
  } catch (error) { next(error); }
});

// Basic aggregate statistics; does not expose individual respondent answers.
router.get('/stats', async (req, res, next) => {
  try {
    const [totalResponses, totalQuestions] = await Promise.all([
      SurveyResponse.countDocuments(),
      Question.countDocuments()
    ]);
    res.json({ totalResponses, totalQuestions, questionsPerSurvey: 5 });
  } catch (error) { next(error); }
});

module.exports = router;
