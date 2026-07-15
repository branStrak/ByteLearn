import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  Search,
  BookOpen,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';



const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch profile for name
        const profileRes = await axios.get('/api/auth/profile', config);
        if (profileRes.data && profileRes.data.data?.name) {
          setStudentName(profileRes.data.data.name);
        } else if (profileRes.data && profileRes.data.name) {
          setStudentName(profileRes.data.name);
        }

        const res = await axios.get('/api/quizzes/me', config);
        if (res.data.success) {
          setQuizzes(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: "easeOut" } 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-1/3 bg-slate-200 rounded-2xl"></div>
            <div className="h-24 w-full bg-white border border-slate-100 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white border border-slate-100 rounded-[32px]"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <HelpCircle size={28} />
                </div>
                My Quiz History
              </h1>
              <p className="text-slate-500 font-medium text-lg ml-1">
                Review your performance and track your growth across all courses.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-8 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center gap-6"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Quizzes Completed</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900">{quizzes.length}</span>
                  <span className="text-slate-400 font-bold mb-1">Total</span>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                  +{quizzes.length}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quizzes Grid */}
        <AnimatePresence mode="wait">
          {quizzes.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {quizzes.map((quiz) => (
                <QuizCard key={quiz._id} quiz={quiz} variants={itemVariants} />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[48px] border border-dashed border-slate-200 text-center px-10">
               <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
                <HelpCircle size={56} className="text-indigo-200" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">No quizzes completed yet</h3>
               <p className="text-slate-500 max-w-md mb-10 font-medium">
                 Start your learning journey by jumping into your course modules and testing your knowledge.
               </p>
               <button className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95">
                 Explore Courses <ArrowUpRight size={20} />
               </button>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const QuizCard = ({ quiz, variants }) => {
  const percentage = Math.round((quiz.score / quiz.totalMarksPossible) * 100) || 0;

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -8, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)" }}
      className="group bg-white rounded-[40px] overflow-hidden border border-slate-200 transition-all duration-300 flex flex-col h-full"
    >
      {/* Header with tint */}
      <div className="p-10 bg-indigo-50/50 border-b border-indigo-100/30">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-3 leading-none">
          {quiz.courseId?.title}
        </p>
        <h3 className="text-2xl font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
          {quiz.quizId?.title}
        </h3>
      </div>

      <div className="p-10 flex-grow flex flex-col justify-between">
        {/* Body: Attempt and Date in a clean row */}
        <div className="flex items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-2.5 text-slate-500">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
              <Clock size={14} className="text-slate-400" />
            </div>
            <span className="text-[13px] font-bold text-slate-600">Attempt #{quiz.attemptNumber}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-500">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
              <Calendar size={14} className="text-slate-400" />
            </div>
            <span className="text-[13px] font-bold text-slate-600">
              {new Date(quiz.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Footer/Metrics Area: Large centralized block */}
        <div className="flex flex-col items-center">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6">Final Score</p>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-6xl font-black text-slate-900 tracking-tighter">
              {quiz.score}
              <span className="text-2xl text-slate-300 font-bold ml-2">/ {quiz.totalMarksPossible}</span>
            </p>
            
            <div className={`mt-4 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl ${percentage >= 50 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
              {percentage >= 50 ? 'PASSED' : 'COMPLETED'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CustomArrowUpRight = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export default Quizzes;
