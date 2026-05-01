const express = require('express');
const router = express.Router();
const { generateQuiz, saveQuizResult } = require('../controllers/quizController');

router.post('/generate', generateQuiz);
router.post('/submit', saveQuizResult);

module.exports = router;
