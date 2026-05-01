const Query = require('../models/Query');
const File = require('../models/File');
const Quiz = require('../models/Quiz');

const getHistory = async (req, res) => {
  try {
    const queries = await Query.find().sort({ timestamp: -1 }).limit(20);
    const files = await File.find().sort({ uploadDate: -1 });
    const quizzes = await Quiz.find().sort({ timestamp: -1 });

    res.json({
      queries,
      files,
      quizzes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};

module.exports = { getHistory };
