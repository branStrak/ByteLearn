import React from 'react';
import { ArrowRight, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ id, title, instructor, duration, progress, rating, totalRatings }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      whileHover={{ scale: 1.01, x: 5 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/learn/${id}`)}
      className="bg-slate-50/50 rounded-[22px] border border-slate-100 p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 cursor-pointer"
    >
      <div className="flex-grow">
        <h3 className="font-bold text-slate-800 text-[18px] mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
        <div className="flex flex-col gap-1 mb-6">
          <p className="text-[13px] font-semibold text-slate-500 flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              {instructor}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock size={15} /> {duration}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-[12px] font-bold text-amber-700">
                {(rating || 0).toFixed(1)}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              ({totalRatings || 0} {totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pr-0 md:pr-12">
          <div className="flex-grow">
            <div className="flex justify-between items-end mb-2.5">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
              <span className="text-[13px] font-black text-slate-700 tabular-nums">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-[7px] border border-slate-50">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-[7px] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all duration-700 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 flex justify-end mt-4 md:mt-0">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/learn/${id}`);
          }}
          className="bg-white hover:bg-blue-600 text-blue-600 hover:text-white border-2 border-blue-500/20 hover:border-blue-600 font-bold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-[14px] shadow-sm hover:shadow-blue-200"
        >
          Resume <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;
