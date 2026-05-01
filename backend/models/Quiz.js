const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    answer: String,
    type: { type: String, enum: ['MCQ', 'SHORT'], default: 'MCQ' }
  }],
  score: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
