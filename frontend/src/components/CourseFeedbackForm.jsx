import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const CourseFeedbackForm = ({ courseId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchMyFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/feedback/my-feedback/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          setRating(res.data.data.rating);
          setReview(res.data.data.review || '');
          setHasSubmitted(true);
        }
      } catch (err) {
        console.error('Error fetching existing feedback:', err);
      }
    };

    if (courseId) {
      fetchMyFeedback();
    }
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/feedback', {
        courseId,
        rating,
        review
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setHasSubmitted(true);
      toast.success('Feedback submitted successfully!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-2xl mx-auto mt-12"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">How was your learning experience?</h2>
        <p className="text-slate-500">Your feedback helps us improve and helps other students make informed decisions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                className="focus:outline-none p-1 transition-colors"
                aria-label={`Rate ${star} stars`}
              >
                <Star 
                  size={42} 
                  strokeWidth={1.5}
                  className={`${
                    (hoverRating || rating) >= star 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-300'
                  } transition-colors duration-200`}
                />
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p 
              key={hoverRating || rating}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-bold text-amber-600 text-lg h-6"
            >
              {hoverRating || rating > 0 ? (
                ['Terrible', 'Poor', 'Average', 'Good', 'Amazing'][(hoverRating || rating) - 1]
              ) : (
                'Select a rating'
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <label htmlFor="review" className="text-sm font-bold text-slate-700 ml-1">
            Write a review (Optional)
          </label>
          <textarea
            id="review"
            rows="4"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell others what you liked or how we can improve..."
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 leading-relaxed"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${
            rating === 0 || isSubmitting
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            hasSubmitted ? 'Update Feedback' : 'Submit Feedback'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CourseFeedbackForm;
