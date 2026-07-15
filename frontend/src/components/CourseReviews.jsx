import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, User } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseReviews = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/feedback/course/${courseId}`);
        if (res.data.success) {
          setReviews(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchReviews();
    }
  }, [courseId]);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-20 border-t border-slate-100 pt-20 pb-32">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16 px-4">
        <div className="max-w-xl">
          <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight leading-tight">
            Student Success Stories
          </h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Discover how this course has helped students achieve their goals and transform their skills.
          </p>
        </div>
        
        <div className="bg-white rounded-[40px] p-8 lg:p-10 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 min-w-[240px]">
           <div className="flex items-baseline gap-1 mb-2">
              <span className="text-6xl font-black text-slate-800 tracking-tighter">
                {calculateAverageRating()}
              </span>
              <span className="text-slate-400 text-xl font-bold">/ 5.0</span>
           </div>
           
           <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={20} 
                  className={`${
                    Math.round(calculateAverageRating()) >= star 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-200'
                  }`}
                />
              ))}
           </div>
           
           <div className="h-1.5 w-12 bg-blue-600 rounded-full mb-6"></div>
           
           <div className="flex flex-col">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                Based on
              </p>
              <p className="text-slate-800 font-black text-xl">
                {reviews.length} Verified Reviews
              </p>
           </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-slate-50/50 rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200 mx-4">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
             <Star className="text-slate-200" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Join the conversation</h3>
          <p className="text-slate-400 font-medium">Be the first to share your learning experience with other students.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4"
        >
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              variants={itemVariants}
              className="group relative bg-white border border-slate-100 rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-blue-100 transition-all duration-500"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <h4 className="font-bold text-slate-800 text-lg tracking-tight mb-1">
                      {review.studentId?.name || 'Anonymous Student'}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex gap-0.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={`${
                          review.rating >= star 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <p className="text-slate-600 text-[15.5px] leading-[1.6] font-medium italic pl-4 border-l-4 border-blue-50">
                    "{review.review || 'Excellent course content and presentation! Highly recommended for anyone looking to master these skills.'}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CourseReviews;
