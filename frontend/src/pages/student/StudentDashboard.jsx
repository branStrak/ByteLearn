import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, CheckCircle, Award, Clock, ArrowRight, FileText } from 'lucide-react';

import ContinueLearningSection from '../../components/common/ContinueLearningSection';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch profile for name
        const profileRes = await axios.get('/api/auth/profile', config);
        if (profileRes.data && profileRes.data.data?.name) {
          setStudentName(profileRes.data.data.name);
        } else if (profileRes.data && profileRes.data.name) {
          setStudentName(profileRes.data.name);
        }

        // Fetch dashboard data
        const res = await axios.get('/api/dashboard/student', config);
        setData(res.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-10">
          <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-xl mb-4"></div>
          <div className="h-5 w-96 bg-slate-200 animate-pulse rounded-lg mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-[24px]"></div>)}
          </div>
          <div className="h-64 bg-slate-200 animate-pulse rounded-[32px] mb-12"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-slate-200 animate-pulse rounded-[24px]"></div>
            <div className="h-80 bg-slate-200 animate-pulse rounded-[24px]"></div>
          </div>
        </main>
      </div>
    );
  }

  const { metrics, activeCourses, recentQuizzes, recentAssignments } = data || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans mb-16">
      
      <motion.main 
        className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <motion.div className="mb-10" variants={itemVariants}>
          <h1 className="text-[36px] font-bold text-slate-900 mb-2 tracking-tight">
            Welcome back, {studentName.split(' ')[0]}! 👋
          </h1>
          <p className="text-[16px] text-slate-500 font-medium">
            Your progress looks great! Continue where you left off.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={itemVariants}
        >
          {/* Card 1: Enrolled */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="flex-1 h-44 bg-white rounded-2xl border border-gray-100 shadow-lg p-8 flex items-center justify-between transition-all duration-300 hover:shadow-2xl overflow-hidden relative group"
          >
            {/* Geometric Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <svg width="100%" height="100%"><pattern id="pattern-1" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 40L40 0M0 0l40 40" fill="none" stroke="currentColor" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#pattern-1)"/></svg>
            </div>

            <div className="flex flex-col z-10 relative">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-2">Enrolled Courses</p>
              <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{metrics?.totalEnrolled || 0}</h3>
            </div>

            {/* Dimensional Illustration: Blue */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl scale-150 group-hover:scale-[2] transition-transform duration-700"></div>
              <div className="relative w-full h-full flex items-center justify-center opacity-90 scale-125">
                <div className="absolute text-blue-100 rotate-12 -translate-x-8 -translate-y-4">
                  <Book size={80} strokeWidth={0.5} />
                </div>
                <div className="absolute text-blue-200 -rotate-6 translate-x-4 translate-y-2">
                  <Book size={64} strokeWidth={0.5} />
                </div>
                <div className="relative text-blue-600 drop-shadow-2xl animate-pulse">
                  <svg viewBox="0 0 24 24" fill="none" className="w-24 h-24" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z"/>
                  </svg>
                </div>
                {/* Glowing particles */}
                <div className="absolute top-4 left-10 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_white]"></div>
                <div className="absolute bottom-10 right-10 w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_10px_white]"></div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Completed */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="flex-1 h-44 bg-white rounded-2xl border border-gray-100 shadow-lg p-8 flex items-center justify-between transition-all duration-300 hover:shadow-2xl overflow-hidden relative group"
          >
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <svg width="100%" height="100%"><pattern id="pattern-2" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="currentColor"/></pattern><rect width="100%" height="100%" fill="url(#pattern-2)"/></svg>
            </div>

            <div className="flex flex-col z-10 relative">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-2">Completed Courses</p>
              <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{metrics?.completedCourses || 0}</h3>
            </div>

             {/* Dimensional Illustration: Emerald */}
             <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl scale-150 group-hover:scale-[2] transition-transform duration-700"></div>
              <div className="relative w-full h-full flex items-center justify-center opacity-90 scale-125">
                <div className="absolute text-emerald-100 -rotate-12 -translate-x-12">
                   <svg viewBox="0 0 24 24" fill="none" className="w-32 h-32" stroke="currentColor" strokeWidth="0.5">
                    <path d="M12 2c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zM4.93 4.93c.78-.78 2.05-.78 2.83 0 .78.78.78 2.05 0 2.83-.78.78-2.05.78-2.83 0-.78-.78-.78-2.05 0-2.83zm14.14 0c-.78-.78-2.05-.78-2.83 0-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0 .78-.78.78-2.05 0-2.83z"/>
                  </svg>
                </div>
                <div className="relative text-emerald-600 drop-shadow-2xl">
                  <CheckCircle size={80} strokeWidth={1} />
                </div>
                {/* Finish Line Banner (Stylized) */}
                <div className="absolute bottom-6 bg-emerald-600 text-[8px] text-white font-black px-3 py-1 rounded-sm rotate-3 shadow-lg uppercase tracking-[0.2em]">
                  Finish Line
                </div>
                {/* Confetti */}
                <div className="absolute top-8 left-4 w-2 h-1 bg-yellow-400 rotate-45 rounded-sm"></div>
                <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Certificates */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="flex-1 h-44 bg-white rounded-2xl border border-gray-100 shadow-lg p-8 flex items-center justify-between transition-all duration-300 hover:shadow-2xl overflow-hidden relative group"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <svg width="100%" height="100%"><pattern id="pattern-3" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 0h30v30H0z" fill="none"/><path d="M0 15h30" stroke="currentColor" strokeWidth="0.5"/></pattern><rect width="100%" height="100%" fill="url(#pattern-3)"/></svg>
            </div>

            <div className="flex flex-col z-10 relative">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-2">Certificates Earned</p>
              <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{metrics?.certificatesEarned || 0}</h3>
            </div>

            {/* Dimensional Illustration: Orange */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none">
              <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-3xl scale-150 group-hover:scale-[2] transition-transform duration-700"></div>
              <div className="relative w-full h-full flex items-center justify-center opacity-90 scale-125">
                <div className="absolute text-orange-100 rotate-45 translate-x-4">
                   <FileText size={100} strokeWidth={0.3} />
                </div>
                <div className="relative text-orange-600 drop-shadow-2xl">
                  <Award size={86} strokeWidth={1} />
                </div>
                {/* Wax Seal (Stylized) */}
                <div className="absolute bottom-8 right-10 w-8 h-8 bg-red-600 rounded-full border-2 border-orange-200 shadow-inner flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border border-white/30"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Continue Learning */}
        <motion.div variants={itemVariants} className="mb-12">
           <ContinueLearningSection courses={activeCourses} />
        </motion.div>

        {/* Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quizzes */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[19px] font-bold text-slate-900">Recent Quizzes</h2>
              <Link to="/quizzes" className="text-blue-600 text-sm font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all">
                View History <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentQuizzes?.length > 0 ? recentQuizzes.map((quiz) => (
                <motion.div 
                  key={quiz._id}
                  whileHover={{ x: 5 }}
                  className="group bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-slate-100 p-5 rounded-[20px] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-[15px] mb-1">{quiz.quizId?.title}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(quiz.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-500 tabular-nums">{quiz.score}%</span>
                  </div>
                </motion.div>
              )) : (
                <div className="py-12 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No quiz attempts yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Assignments */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[19px] font-bold text-slate-900">Assignments Status</h2>
              <Link to="/assignments" className="text-blue-600 text-sm font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Check Portal <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentAssignments?.length > 0 ? recentAssignments.map((sub) => (
                <motion.div 
                  key={sub._id}
                  whileHover={{ x: 5 }}
                  className="group bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-slate-100 p-5 rounded-[20px] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-[15px] mb-1">{sub.assignmentId?.title}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                         {sub.status === 'graded' ? `Graded` : `Submitted`} • {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {sub.status === 'graded' ? (
                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-600 tabular-nums">{sub.marksObtained}</span>
                        <span className="text-xs font-bold text-slate-400 ml-1">/100</span>
                      </div>
                    ) : (
                      <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border border-amber-200/50 whitespace-nowrap shadow-sm">
                        Pending review
                      </span>
                    )}
                  </div>
                </motion.div>
              )) : (
                <div className="py-12 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No assignments submitted</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.main>
    </div>
  );
};

export default StudentDashboard;
