import React, { useState } from 'react';
import axios from 'axios';
import { Brain, CheckCircle2, Trophy, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const QuizView = () => {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const startQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setSubmitted(false);
    setAnswers({});
    try {
      const { data } = await axios.post('/api/quiz/generate', { topic: 'General knowledge from docs' });
      setQuiz(data);
    } catch (err) {
      alert('Failed to generate quiz. Ensure you have uploaded documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qIdx, val) => {
    setAnswers(prev => ({ ...prev, [qIdx]: val }));
  };

  const handleSubmit = async () => {
    let currentScore = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx]?.toLowerCase() === q.answer.toLowerCase()) {
        currentScore++;
      }
    });

    const finalScore = Math.round((currentScore / quiz.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    try {
      await axios.post('/api/submit', {
        title: quiz.title,
        questions: quiz.questions,
        score: finalScore
      });
    } catch (err) {
      console.error('Failed to save score');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
        <p className="animate-pulse">Gemini is analyzing your docs to create a custom quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
        <Brain size={48} className="mx-auto mb-4 text-blue-600 opacity-50" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Test Your Knowledge</h2>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Generate a custom quiz based on the documents you've uploaded to HiveFind.
        </p>
        <button
          onClick={startQuiz}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto"
        >
          Generate Quiz <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-sm text-gray-500">{quiz.questions.length} Questions</p>
        </div>
        {submitted && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-bold">
            <Trophy size={20} />
            Score: {score}%
          </div>
        )}
      </div>

      {quiz.questions.map((q, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <p className="font-semibold text-gray-800">
            {idx + 1}. {q.question}
          </p>

          {q.type === 'MCQ' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  disabled={submitted}
                  onClick={() => handleAnswerChange(idx, opt)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    answers[idx] === opt 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    submitted && opt === q.answer ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                disabled={submitted}
                placeholder="Type your answer here..."
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {submitted && (
                <div className="text-sm bg-gray-50 p-3 rounded-lg flex items-start gap-2 text-gray-600">
                  <CheckCircle2 size={16} className="text-green-500 mt-1 shrink-0" />
                  Correct answer: {q.answer}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Submit Quiz
        </button>
      ) : (
        <button
          onClick={startQuiz}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all"
        >
          Take Another Quiz
        </button>
      )}
    </div>
  );
};

export default QuizView;
