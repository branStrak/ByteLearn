import React, { useState } from 'react';
import axios from 'axios';
import { Send, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';

const SupportQuery = ({ courseId, lessonId, onQuerySubmitted }) => {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/queries', {
        courseId,
        lessonId,
        question: question.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setQuestion('');
      if (onQuerySubmitted) onQuerySubmitted();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting query:', err);
      setError(err.response?.data?.message || 'Failed to send question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <MessageSquare size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ask Instructor</h3>
          <p className="text-xs text-slate-500 font-medium">Have a doubt? Ask the teacher directly.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {success ? (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in duration-300">
            <CheckCircle2 size={20} />
            <p className="text-sm font-bold tracking-tight">Question sent to the instructor!</p>
          </div>
        ) : (
          <>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe your doubt here..."
              rows="4"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 text-sm"
              required
            />
            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting || !question.trim()}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Question
                </>
              )}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default SupportQuery;
