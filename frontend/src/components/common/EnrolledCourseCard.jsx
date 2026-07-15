import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Clock, Star, CheckCircle } from 'lucide-react';

const EnrolledCourseCard = ({ enrollment, progress }) => {
  const navigate = useNavigate();
  const {
    _id,
    title,
    description,
    thumbnail,
    educatorId,
    coInstructors,
    duration
  } = enrollment;

  const allInstructorNames = [
    educatorId?.name,
    ...(coInstructors?.map(ci => ci.userId?.name) || [])
  ].filter(Boolean).join(', ');

  return (
    <div 
      onClick={() => navigate(`/learn/${_id}`)}
      className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={thumbnail || "https://via.placeholder.com/400x250?text=Course"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Body Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Text content wrapped in a container that grows */}
        <div className="flex-grow">
          <h3 className="font-bold text-slate-800 text-[16px] leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-[13px] text-slate-500 font-medium mb-3 line-clamp-1">
            By {allInstructorNames || 'ByteLearn Faculty'}
          </p>
          <p className="text-slate-500 text-[13px] leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
            {description}
          </p>
        </div>

        {/* Action & Progress area - always at bottom */}
        <div className="mt-auto space-y-5">
          {progress === 100 ? (
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700 tracking-wide">COMPLETED</span>
              </div>
              <Link
                to="/certificates"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg transition-colors hover:bg-emerald-100 block text-center"
              >
                View Certificate
              </Link>
            </div>
          ) : (
            <>
              {/* Progress Section */}
              <div>
                <div className="flex justify-end mb-1.5">
                  <span className="text-sm font-semibold text-slate-600">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Continue Learning Button */}
              <div 
                className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all text-center shadow-lg shadow-blue-100 active:scale-[0.98]"
              >
                Continue Learning
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;
