require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Question = require('./models/Question');
const sampleQuestions = require('./data/sampleQuestions');
const surveyRoutes = require('./routes/surveyRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Survey API is running' }));
app.use('/api', surveyRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error. Please try again.' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const count = await Question.countDocuments();
    if (count === 0) {
      await Question.insertMany(sampleQuestions);
      console.log(`${sampleQuestions.length} sample questions inserted`);
    }
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

start();
