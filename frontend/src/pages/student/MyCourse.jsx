import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import EnrolledCourseCard from '../../components/common/EnrolledCourseCard';

const MyCourse = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get('/api/enrollments/my-courses', config);
        
        if (response.data.success) {
          setEnrolledCourses(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch courses');
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses. Please try again.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Courses</h1>
          <p className="text-slate-500">Continue your learning journey with your enrolled courses</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-medium text-slate-800 mb-2">No courses found</h3>
            <p className="text-slate-500 mb-6">You haven't enrolled in any courses yet.</p>
            <Link 
              to="/browse" 
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrolledCourses.map(item => {
              const course = item.courseId;
              if (!course) return null;

              const adaptedCourse = {
                _id: course._id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail,
                price: course.price,
                isFree: !course.isPaid,
                educatorId: course.educatorId,
                coInstructors: course.coInstructors,
                enrollmentCount: course.totalStudents || 0,
                duration: course.duration || 'N/A',
                level: course.level,
                rating: course.rating || 0,
                totalRatings: course.totalRatings || 0
              };

              return (
                <EnrolledCourseCard 
                  key={item._id} 
                  enrollment={adaptedCourse} 
                  progress={item.progressPercentage || 0} 
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCourse;
