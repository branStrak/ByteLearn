import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';
import Footer from '../../components/layout/Footer';

const EducatorDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    totalCourses: 0,
    approvedCourses: 0,
    pendingApprovals: 0,
    totalStudents: 0
  });
  const [coursesList, setCoursesList] = useState([]);
  const [educatorName, setEducatorName] = useState('Educator');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || token === 'null' || token === 'undefined') {
            navigate('/login');
            return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch User Profile
        const profileRes = await axios.get('/api/auth/profile', config);
        setEducatorName(profileRes.data.name);

        // Fetch Stats
        const statsRes = await axios.get('/api/courses/dashboard-stats', config);
        if (statsRes.data.success) {
           setStatsData(statsRes.data.data.stats);
           setCoursesList(statsRes.data.data.recentCourses);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
             navigate('/login');
        }
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const stats = [
    { title: 'CREATED COURSES', value: statsData.totalCourses, icon: <BookOpen size={24} />, color: 'blue' },
    { title: 'TOTAL STUDENTS', value: statsData.totalStudents, icon: <Users size={24} />, color: 'emerald' },
    { title: 'PENDING APPROVALS', value: statsData.pendingApprovals, icon: <Clock size={24} />, color: 'indigo' },
    { title: 'APPROVED COURSES', value: statsData.approvedCourses, icon: <CheckCircle2 size={24} />, color: 'amber' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50/50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50/50', text: 'text-emerald-600' },
    indigo: { bg: 'bg-indigo-50/50', text: 'text-indigo-600' },
    amber: { bg: 'bg-amber-50/50', text: 'text-amber-600' }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <EducatorHeader educatorName={educatorName} activePage="/educator-dashboard" />
      
      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-[32px] font-bold text-slate-800 tracking-tight mb-1">Welcome back, {educatorName.split(' ')[0]}!</h1>
          <p className="text-slate-500 font-medium">Manage your courses and engage with students from your command center.</p>
        </div>

        {/* 4 Stat Cards - Redesigned with Median Blue UI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#EFF6FF] p-6 rounded-[32px] border border-[#DBEAFE] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
              {/* Background Decorative Icon */}
              <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 text-slate-900">
                {React.cloneElement(stat.icon, { size: 100 })}
              </div>
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[stat.color].bg} ${colorMap[stat.color].text} shadow-inner`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.title}</p>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* My Courses Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold text-slate-800">My Courses</h2>
            <Link to="/educator/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-200 p-2 max-h-[460px] overflow-y-auto custom-scrollbar">
            {coursesList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No courses created yet. Click "Create Course" to get started!</div>
            ) : (
             coursesList.map((course) => (
              <div key={course.id} className="p-4 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-between group cursor-default">
                <div>
                   <div className="flex items-center gap-3 mb-1.5">
                     <h3 className="text-[15px] font-bold text-slate-800">{course.title}</h3>
                     {course.status === 'approved' && (
                       <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                         Approved
                       </span>
                     )}
                     {course.status === 'pending' && (
                       <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                         Pending
                       </span>
                     )}
                   </div>
                   <p className="text-xs text-slate-500 font-medium">
                     {course.students} students enrolled <span className="mx-1">•</span> {course.modules} modules
                   </p>
                </div>
                
                <button 
                  onClick={() => navigate(`/course/${course._id || course.id}/curriculum`)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm focus:ring-4 focus:ring-blue-100 shadow-blue-600/20 active:scale-95"
                >
                  Manage <ArrowRight size={16} />
                </button>
              </div>
             ))
            )}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default EducatorDashboard;
