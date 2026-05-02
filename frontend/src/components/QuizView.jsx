import React, { useState } from 'react';
import axios from 'axios';
import { Brain, CheckCircle2, Trophy, ArrowRight, Loader2, RotateCcw, XCircle } from 'lucide-react';

const QuizView = () => {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);

  const startQuiz = async () => {
    setLoading(true); setQuiz(null); setSubmitted(false); setAnswers({}); setError(null);
    try {
      const { data } = await axios.post('/api/quiz/generate', { topic: 'General knowledge from docs' });
      setQuiz(data);
    } catch {
      setError('Failed to generate quiz. Make sure you have uploaded documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i]?.toLowerCase() === q.answer.toLowerCase()) correct++;
    });
    const finalScore = Math.round((correct / quiz.questions.length) * 100);
    setScore(finalScore); setSubmitted(true);
    try { await axios.post('/api/submit', { title: quiz.title, questions: quiz.questions, score: finalScore }); }
    catch { /* non-critical */ }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 size={32} className="animate-spin text-blue-400" />
      <p className="text-[13px] text-hf-muted animate-pulse">Gemini is analyzing your docs…</p>
    </div>
  );

  /* ── Error ── */
  if (error && !quiz) return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <XCircle size={24} className="text-red-400" />
      </div>
      <h3 className="text-base font-bold text-hf mb-1">Generation Failed</h3>
      <p className="text-[13px] text-hf-muted mb-6">{error}</p>
      <button onClick={startQuiz} className="bg-hf-surface border border-hf text-hf text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:border-hf-md transition-all">
        Try Again
      </button>
    </div>
  );

  /* ── Empty state ── */
  if (!quiz) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-hf-blue-dim border border-blue-500/20 flex items-center justify-center mb-6">
        <Brain size={30} className="text-blue-400" />
      </div>

      <h2 className="text-xl font-bold text-hf mb-2 tracking-tight">Test Your Knowledge</h2>
      <p className="text-[13px] text-hf-muted mb-8 text-center max-w-xs leading-relaxed">
        Generate a custom quiz based on the documents you've uploaded to HiveFind.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['Multiple choice', 'Short answer', 'AI-generated', 'Instant scoring'].map(tag => (
          <span key={tag} className="text-[11px] font-semibold bg-hf-surface border border-hf text-hf-muted px-3 py-1.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <button onClick={startQuiz}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/25"
      >
        Generate Quiz <ArrowRight size={16} />
      </button>
    </div>
  );

  /* ── Quiz ── */
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-5 animate-in">
      {/* Header card */}
      <div className="bg-hf-surface border border-hf rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-hf">{quiz.title}</h2>
          <p className="text-[11px] text-hf-muted mt-0.5">{quiz.questions.length} questions</p>
        </div>
        {submitted && (
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12px] font-bold ${
            score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            score >= 50 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <Trophy size={14} /> {score}%
          </div>
        )}
      </div>

      {/* Questions */}
      {quiz.questions.map((q, idx) => {
        const isCorrect = submitted && answers[idx]?.toLowerCase() === q.answer.toLowerCase();
        const isWrong   = submitted && answers[idx] && !isCorrect;

        return (
          <div key={idx} className="bg-hf-surface border border-hf rounded-2xl p-5 space-y-4">
            <p className="text-[13px] font-semibold text-hf leading-snug">
              <span className="text-hf-subtle mr-1.5">{idx + 1}.</span>{q.question}
            </p>

            {q.type === 'MCQ' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => {
                  const chosen  = answers[idx] === opt;
                  const correct = submitted && opt === q.answer;
                  return (
                    <button key={oIdx} disabled={submitted} onClick={() => setAnswers(p => ({ ...p, [idx]: opt }))}
                      className={`text-left px-4 py-3 rounded-xl border text-[12px] font-medium transition-all ${
                        correct    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
                        chosen && submitted ? 'border-red-500/40 bg-red-500/8 text-red-400' :
                        chosen     ? 'border-blue-500/40 bg-hf-blue-dim text-blue-400' :
                                     'border-hf text-hf-muted hover:border-hf-md hover:text-hf hover:bg-hf-raised'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text" disabled={submitted}
                  placeholder="Type your answer…"
                  onChange={e => setAnswers(p => ({ ...p, [idx]: e.target.value }))}
                  className={`w-full bg-hf-raised border rounded-xl px-4 py-2.5 text-[12px] text-hf placeholder:text-hf-subtle focus:outline-none focus:border-blue-500/50 transition-all ${
                    isCorrect ? 'border-emerald-500/40' : isWrong ? 'border-red-500/40' : 'border-hf'
                  }`}
                />
                {submitted && (
                  <div className="flex items-center gap-2 text-[11px] bg-hf-raised border border-hf rounded-lg px-3 py-2 text-hf-muted">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    Correct: <span className="text-hf font-semibold">{q.answer}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Action button */}
      {!submitted ? (
        <button onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-[14px] transition-all shadow-lg shadow-blue-900/20"
        >
          Submit Quiz
        </button>
      ) : (
        <button onClick={startQuiz}
          className="w-full bg-hf-surface border border-hf hover:border-hf-md text-hf py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw size={15} /> Take Another Quiz
        </button>
      )}
    </div>
  );
};

export default QuizView;