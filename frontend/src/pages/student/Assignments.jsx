import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search,
  BookOpen,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';



const Assignments = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('In Review');
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    const fetchSubmissions = async () => {
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

        const res = await axios.get('/api/submissions/me', config);
        setSubmissions(res.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const navigate = useNavigate();
  const inReview = submissions.filter(sub => sub.status === 'submitted');
  const graded = submissions.filter(sub => sub.status === 'graded');
  const displayedSubmissions = activeTab === 'In Review' ? inReview : graded;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-1/3 bg-slate-200 rounded-2xl"></div>
            <div className="h-24 w-full bg-slate-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-slate-200 rounded-3xl"></div>
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <FileText className="text-blue-600" size={36} />
                My Assignments
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                Track your progress, view feedback, and manage your submissions.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm"
            >
              <div className="px-5 py-3 rounded-xl bg-blue-50 text-blue-700">
                <p className="text-[11px] font-bold uppercase tracking-widest leading-none">Total</p>
                <p className="text-2xl font-black">{submissions.length}</p>
              </div>
              <div className="px-5 py-3 rounded-xl bg-amber-50 text-amber-700">
                <p className="text-[11px] font-bold uppercase tracking-widest leading-none">Pending</p>
                <p className="text-2xl font-black">{inReview.length}</p>
              </div>
              <div className="px-5 py-3 rounded-xl bg-emerald-50 text-emerald-700">
                <p className="text-[11px] font-bold uppercase tracking-widest leading-none">Graded</p>
                <p className="text-2xl font-black">{graded.length}</p>
              </div>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="relative flex p-1.5 bg-slate-100/80 rounded-2xl w-fit border border-slate-200/60">
            {['In Review', 'Graded'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-3 text-sm font-bold transition-all duration-300 rounded-xl z-20 ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
                {tab === 'In Review' && inReview.length > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-md ${activeTab === tab ? 'bg-white/20' : 'bg-slate-200'}`}>
                    {inReview.length}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Assignments Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {displayedSubmissions.length > 0 ? (
              displayedSubmissions.map((sub) => (
                <AssignmentCard key={sub._id} sub={sub} activeTab={activeTab} variants={itemVariants} />
              ))
            ) : (
              <EmptyState tab={activeTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const AssignmentCard = ({ sub, activeTab, variants }) => {
  return (
    <motion.div
      variants={variants}
      layout
      whileHover={{ scale: 1.02, y: -4 }}
      className="group bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300"
    >
      <div className="p-8">
        <div className="mb-8">
          <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-2 leading-none">
            {sub.courseId?.title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
            {sub.assignmentId?.title}
          </h3>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-slate-500">
            <Calendar size={16} />
            <span className="text-sm font-medium">
              Submitted: {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <Clock size={16} />
            <span className="text-sm font-medium">
              Due: {sub.assignmentId?.dueDate ? new Date(sub.assignmentId.dueDate).toLocaleDateString() : 'No due date'}
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          {activeTab === 'In Review' ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-[11px] font-black rounded-xl uppercase tracking-widest border border-amber-200/50">
                <Clock size={14} className="animate-spin-slow" />
                Pending Review
              </span>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Mark</p>
                <p className="text-lg font-black text-slate-800">{sub.assignmentId?.totalMarks || 100}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-[11px] font-black rounded-xl uppercase tracking-widest border border-emerald-200/50">
                  <CheckCircle size={14} />
                  Graded
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    {sub.marksObtained}
                    <span className="text-sm text-slate-400 font-bold ml-1">/{sub.assignmentId?.totalMarks || 100}</span>
                  </p>
                </div>
              </div>
              {sub.feedback && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback</span>
                  </div>
                  <p className="text-[13px] text-slate-600 font-medium italic line-clamp-2">"{sub.feedback}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ tab }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[40px] border border-dashed border-slate-200 text-center px-6"
    >
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        {tab === 'In Review' ? (
          <Clock size={40} className="text-slate-300" />
        ) : (
          <Award size={40} className="text-slate-300" />
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        {tab === 'In Review' ? 'No pending assignments' : 'No graded assignments yet'}
      </h3>
      <p className="text-slate-500 max-w-md mb-8 font-medium">
        {tab === 'In Review' 
          ? "You've caught up on all your submissions! Great job staying ahead of your studies." 
          : "Once your instructors grade your submissions, you'll see your scores and detailed feedback here."}
      </p>
      <button 
        onClick={() => navigate('/browse')}
        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        Browse New Courses <ArrowUpRight size={18} />
      </button>
    </motion.div>
  );
};

const ArrowUpRight = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export default Assignments;
