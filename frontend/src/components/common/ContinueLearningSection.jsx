import React from 'react';
import CourseCard from './CourseCard';
import { ArrowRight, Book } from 'lucide-react';

const ContinueLearningSection = ({ courses = [] }) => {
  if (courses.length === 0) {
    return (
      <div className="mb-8 bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Book className="text-slate-300" size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No active courses</h3>
        <p className="text-slate-400 text-sm">Start a new course and begin your learning journey.</p>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-8 pb-4">
        <h2 className="text-[19px] font-bold text-slate-900 tracking-tight">Continue Learning</h2>
        <button className="text-[14px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-all hover:gap-2.5">
          View All <ArrowRight size={16} />
        </button>
      </div>
      
      <div className="px-8 pb-8 space-y-5">
        {courses.map(course => {
          const instructorList = [
            course.educatorId?.name,
            ...(course.coInstructors?.map(ci => ci.userId?.name) || [])
          ].filter(Boolean).join(', ');

          return (
            <CourseCard 
              key={course._id || course.id}
              id={course.id || course._id}
              title={course.title}
              instructor={instructorList || "Educator"}
              duration={course.totalDuration ? `${course.totalDuration}h` : "8h"}
              progress={course.progressPercentage || 0}
              rating={course.rating}
              totalRatings={course.totalRatings}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ContinueLearningSection;
