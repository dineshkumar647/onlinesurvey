# Online Survey Application

A complete React + Node.js + Express + MongoDB survey application.

## Features
- Displays a random set of 5 questions from the question bank.
- Supports multiple-choice and short-answer questions.
- Validates that all 5 questions are answered before submission.
- Saves responses in MongoDB.
- Displays a submission confirmation and a simple survey statistics page.
- Includes sample questions that are inserted automatically when the question collection is empty.

## Requirements
- Node.js 18+
- MongoDB local server or MongoDB Atlas connection string

## 1. Configure MongoDB
Open `backend/.env.example`, copy it to `backend/.env`, and set your MongoDB connection string.

Example:
```env
MONGO_URI=mongodb://127.0.0.1:27017/online_survey
PORT=5000
```

For MongoDB Atlas, use your Atlas connection string instead. Replace the password placeholder and ensure your IP address is allowed in Atlas Network Access.

## 2. Install dependencies
Open a terminal in the project root:

```bash
npm install
npm run install-all
```

## 3. Start the application
```bash
npm run dev
```

- React frontend: http://localhost:5173
- Express backend: http://localhost:5000
- API health check: http://localhost:5000/api/health

You can also run each side separately:
```bash
npm run server
npm run client
```

## How it works
1. The React app requests `/api/questions/random`.
2. The backend selects 5 random questions from MongoDB.
3. The user answers all five questions and submits.
4. The backend validates and stores the response.
5. The Statistics page shows the number of submissions and responses.

## Project structure
```text
online-survey-application/
├── backend/
│   ├── config/db.js
│   ├── data/sampleQuestions.js
│   ├── models/Question.js
│   ├── models/SurveyResponse.js
│   ├── routes/surveyRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json
└── README.md
```
