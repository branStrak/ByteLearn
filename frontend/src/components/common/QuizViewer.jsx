import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Trophy,
  AlertCircle
} from 'lucide-react';

const QuizViewer = ({ quizId, courseId, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [selections, setSelections] = useState({}); 

  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Initialize or Resume Attempt
        const startRes = await axios.get(`/api/quizzes/${quizId}/start?courseId=${courseId}`, { headers });
        const currentAttempt = startRes.data.data;
        setAttempt(currentAttempt);

        // 2. Fetch Quiz Questions/Structure
        const quizRes = await axios.get(`/api/quizzes/${quizId}`, { headers });
        setQuiz(quizRes.data.data);

        // 3. Populate local state from existing answers
        if (currentAttempt.status === 'in-progress' && currentAttempt.answers) {
          const initialSelections = {};
          currentAttempt.answers.forEach(ans => {
            if (ans.selectedOption !== null) {
              initialSelections[ans.questionId] = ans.selectedOption;
            }
          });
          setSelections(initialSelections);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quiz session");
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetch();
  }, [quizId, courseId]);

  const handleOptionSelect = async (questionId, optionIndex) => {
    // 1. Update local React state immediately for UI speed
    setSelections(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));

    // 2. Fire background API call to autoSaveAnswer
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/quizzes/${quizId}/save`, 
        { questionId, selectedOption: optionIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.post(`/api/quizzes/${quizId}/submit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAttempt(res.data.data);
      if (onComplete) onComplete(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[500px] w-full">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Initializing assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[500px] text-center w-full">
        <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h3>
        <p className="text-slate-600 max-w-md mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
        >
          Retry Access
        </button>
      </div>
    );
  }

  if (attempt && attempt.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[600px] text-center bg-gradient-to-b from-white to-slate-50 w-full animate-in fade-in duration-700">
        <div className="h-28 w-28 bg-emerald-100 rounded-full flex items-center justify-center mb-8 relative">
          <Trophy size={56} className="text-emerald-600" />
          <div className="absolute -top-1 -right-1 h-8 w-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
             <CheckCircle2 size={16} className="text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Quiz Complete!</h2>
        <p className="text-slate-500 mb-10 text-lg max-w-md">You have successfully submitted this assessment.</p>
        
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full transform hover:scale-[1.02] transition-transform">
          <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 block">Final Results</span>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-7xl font-black text-slate-900">{attempt.score}</span>
            <span className="text-3xl font-bold text-slate-300">/ {attempt.totalMarksPossible}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
             <div 
               className="h-full bg-emerald-500" 
               style={{ width: `${(attempt.score / attempt.totalMarksPossible) * 100}%` }}
             />
          </div>
          <div className="text-slate-500 font-bold">
             {Math.round((attempt.score / attempt.totalMarksPossible) * 100)}% Performance Accuracy
          </div>
        </div>
        
        <p className="mt-12 text-slate-400 text-sm font-medium">
          Note: Your progress has been synchronized with the course curriculum.
        </p>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[500px] text-center w-full">
        <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Quiz content unavailable</h3>
        <p className="text-slate-500 max-w-sm">This quiz doesn't have any questions yet or the content failed to load.</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  if (!currentQuestion) return null;
  
  const totalQuestions = quiz.questions.length;
  const selectedOption = currentQuestion._id ? selections[currentQuestion._id] : undefined;

  return (
    <div className="flex flex-col h-full bg-white w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Progress Header */}
      <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Assessment Engine</span>
          <div className="text-2xl font-black text-slate-900">
            Question {currentIndex + 1} <span className="text-slate-300 font-light mx-1">of</span> {totalQuestions}
          </div>
        </div>

        <div className="hidden md:flex gap-2">
           {quiz.questions.map((q, idx) => (
             <button 
               key={idx}
               onClick={() => setCurrentIndex(idx)}
               className={`h-2 w-8 rounded-full transition-all duration-300 ${
                 idx === currentIndex 
                   ? 'bg-blue-600 w-12 shadow-md shadow-blue-100' 
                   : selections[q._id] !== undefined 
                     ? 'bg-emerald-400' 
                     : 'bg-slate-200 hover:bg-slate-300'
               }`}
               title={`Question ${idx + 1}`}
             />
           ))}
        </div>
      </div>

      {/* Question Content */}
      <div className="p-10 md:p-20 flex-grow overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 leading-[1.2] tracking-tight">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(currentQuestion._id, idx)}
                  className={`
                    w-full flex items-center justify-between p-6 rounded-3xl border-2 text-left transition-all duration-300 group
                    ${isSelected 
                      ? 'border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-50/50' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-6">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 font-black text-xl
                      ${isSelected ? 'border-blue-600 bg-blue-600 text-white rotate-[360deg]' : 'border-slate-200 text-slate-300 group-hover:border-slate-400 group-hover:text-slate-500'}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-xl font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                      {option}
                    </span>
                  </div>
                  {isSelected ? (
                    <div className="bg-blue-600 rounded-full p-1 shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full border-2 border-slate-200 group-hover:border-slate-300 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="px-10 py-8 border-t border-slate-100 flex items-center justify-between bg-white">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl text-slate-500 font-black hover:bg-slate-50 disabled:opacity-0 transition-all uppercase tracking-widest text-xs"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex items-center gap-4">
          <p className="hidden sm:block text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Assessment Mode: Single Attempt</p>
          
          {currentIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(selections).length < totalQuestions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-3xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-blue-200 uppercase tracking-[0.2em] text-sm flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finish Assessment'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              className="group flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-black transition-all shadow-xl uppercase tracking-[0.2em] text-xs"
            >
              Next
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizViewer;
