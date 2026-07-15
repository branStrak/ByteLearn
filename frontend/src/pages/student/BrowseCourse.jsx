import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, AlertCircle, Tag } from 'lucide-react';

import BrowseCourseCard from '../../components/common/BrowseCourseCard';

const BrowseCourse = () => {
  const [rawCourses, setRawCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [availableCategories, setAvailableCategories] = useState(['All Categories']);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Step 3: Initialization - Exactly ONE request without query parameters
        const response = await axios.get('/api/courses');
        const coursesData = response.data?.data || response.data || [];
        
        if (Array.isArray(coursesData)) {
           // Step 3.5: Fetch enrollments to filter out already enrolled courses
           const token = localStorage.getItem('token');
           let enrolledCourseIds = new Set();
           if (token) {
               try {
                   const enrollmentRes = await axios.get('/api/enrollments/my-courses', {
                       headers: { Authorization: `Bearer ${token}` }
                   });
                   const enrollments = enrollmentRes.data?.data || [];
                   enrollments.forEach(enroll => {
                       if (enroll.courseId && enroll.courseId._id) {
                           enrolledCourseIds.add(enroll.courseId._id);
                       } else if (enroll.courseId) {
                           enrolledCourseIds.add(enroll.courseId);
                       }
                   });
               } catch (enrollErr) {
                   console.error("Failed to fetch enrollments for filtering:", enrollErr);
               }
           }

           const enrichedCourses = coursesData.map(c => ({
               ...c,
               isEnrolled: enrolledCourseIds.has(c._id)
           }));

           setRawCourses(enrichedCourses);
           
           // Step 3: Dynamic Category Extraction
           const courseCategories = enrichedCourses.map(course => course.category);
           const validCategories = courseCategories.filter(cat => cat && typeof cat === 'string' && cat.trim() !== '');
           const uniqueCategories = [...new Set(validCategories)];
           
           setAvailableCategories(['All Categories', ...uniqueCategories]);
        } else {
           setRawCourses([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error initialization phase failed:', err);
        setError(err.response?.data?.message || 'Failed to initialize courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Step 4: Reactive Filter Engine
  useEffect(() => {
    let filtered = [...rawCourses];

    // 1. Apply Selected Category Filter
    if (selectedCategory !== 'All Categories') {
        filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // 2. Apply Price Type Filter
    if (selectedPriceType === 'Free') {
        filtered = filtered.filter(course => !course.isPaid || course.price === 0 || course.price === '0');
    } else if (selectedPriceType === 'Paid') {
        filtered = filtered.filter(course => course.isPaid && course.price > 0);
    }

    // 3. Apply Search Query Filter (Case-Insensitive)
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(course => 
            (course.title?.toLowerCase().includes(query) || 
             course.description?.toLowerCase().includes(query))
        );
    }

    setDisplayedCourses(filtered);
  }, [rawCourses, selectedCategory, searchQuery, selectedPriceType]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-12">
      
      <main className="flex-grow max-w-[1400px] w-full mx-auto px-6 py-[42px]">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-slate-800 tracking-tight leading-tight mb-1">Browse Courses</h1>
          <p className="text-slate-500 text-[15px]">Discover courses and start learning today</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col xl:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-grow shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200/80 rounded-xl text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="relative min-w-[200px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center absolute inset-y-0 left-4 pointer-events-none">
                  <Filter size={18} className="text-slate-500" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-12 pl-[42px] pr-10 bg-white border border-slate-200/80 rounded-xl text-[14px] font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all cursor-pointer"
              >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
              </div>
            </div>

            {/* Price Filter */}
            <div className="relative min-w-[160px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center absolute inset-y-0 left-4 pointer-events-none">
                  <Tag size={18} className="text-slate-500" />
              </div>
              <select
                value={selectedPriceType}
                onChange={(e) => setSelectedPriceType(e.target.value)}
                className="w-full h-12 pl-[42px] pr-10 bg-white border border-slate-200/80 rounded-xl text-[14px] font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Free">Free Only</option>
                <option value="Paid">Paid Only</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Grid and State Handling */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-[26px]">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 h-[390px] animate-pulse">
                <div className="h-48 bg-slate-100 rounded-t-2xl"></div>
                <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                  <div className="h-5 bg-slate-100 rounded-md w-3/4 mb-3"></div>
                  <div className="h-3.5 bg-slate-50 rounded-md w-full mb-2"></div>
                  <div className="h-3.5 bg-slate-50 rounded-md w-5/6 mb-auto"></div>
                  
                  <div className="flex gap-4 mb-5">
                    <div className="h-3 w-16 bg-slate-50 rounded"></div>
                    <div className="h-3 w-10 bg-slate-50 rounded"></div>
                    <div className="h-3 w-10 bg-slate-50 ml-auto rounded"></div>
                  </div>
                  <div className="h-[42px] bg-slate-100 rounded-xl w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
           <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center mt-12 py-16">
             <AlertCircle size={48} className="mb-4 text-red-500 opacity-80" />
             <h3 className="text-[18px] font-bold mb-2">Oops! Something went wrong</h3>
             <p className="text-red-500/80 text-[15px]">{error}</p>
             <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors text-[14px]">
               Try Again
             </button>
           </div>
        ) : displayedCourses.length === 0 ? (
           <div className="bg-white p-12 py-20 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center mt-8">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
               <Search size={28} className="text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">No courses found</h3>
             <p className="text-slate-500 text-[15px] max-w-md">We couldn't find any courses matching your search criteria. Try adjusting your terms or filter category.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[26px]">
            {displayedCourses.map((course) => (
              <BrowseCourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseCourse;
