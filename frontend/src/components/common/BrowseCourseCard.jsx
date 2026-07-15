import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users } from 'lucide-react';

const BrowseCourseCard = ({ course }) => {
  const navigate = useNavigate();

  const _id = course?._id || '';
  const title = course?.title || 'Untitled Course';
  const description = course?.description || 'No description available.';
  const thumbnail = course?.thumbnail || 'https://via.placeholder.com/400x200?text=Course+Thumbnail'; 
  const price = course?.price;
  const isFree = course?.isFree || price === 0 || price === '0' || !price;

  return (
    <div 
      onClick={() => navigate(course.isEnrolled ? `/learn/${_id}` : `/course/${_id}`)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full group cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-4 mb-1.5">
          <h3 className="font-bold text-slate-800 text-[18px] leading-[1.4] line-clamp-2 flex-grow">{title}</h3>
          <div className="flex-shrink-0 mt-0.5">
            {isFree ? (
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-wide">
                Free
              </span>
            ) : (
              <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-100">
                ₹{Number(price).toFixed(0)}
              </span>
            )}
          </div>
        </div>
        
        {/* Educator Names - Displaying all collaborators */}
        <p className="text-[13px] text-slate-500 font-medium mb-2 line-clamp-1">
          By {[
            course?.educatorId?.name, 
            ...(course?.coInstructors?.map(ci => ci.userId?.name) || [])
          ].filter(Boolean).join(', ')}
        </p>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-[13px] font-bold text-slate-700">
              {(course?.rating || 0).toFixed(1)}
            </span>
          </div>
          <span className="text-[12px] text-slate-400">({course?.totalRatings || 0} reviews)</span>
        </div>

        {/* Meta Info Row */}
        <div className="mt-auto mb-4 flex items-center text-[13px] text-slate-500 font-medium border-t border-slate-50 pt-3">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Users size={14} className="text-slate-400" />
            <span>{course?.enrolledStudents || 0} Learners</span>
          </div>

          <div className={`ml-auto px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
            (course.level || 'Beginner') === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
            (course.level || 'Beginner') === 'Intermediate' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {course.level || 'Beginner'}
          </div>
        </div>

        {/* Action Button */}
        {course.isEnrolled ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/learn/${_id}`);
            }}
            className="w-full bg-white border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50 font-bold py-[9px] px-4 rounded-[10px] transition-colors text-[14px]"
          >
            Continue Learning
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/course/${_id}`);
            }}
            className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-[11px] px-4 rounded-[10px] transition-colors shadow-[0_2px_10px_rgba(37,99,235,0.2)] text-[14px]"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default BrowseCourseCard;
