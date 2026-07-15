import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  UserPlus,
  BookCheck,
  Loader2,
  Wallet,
  IndianRupee
} from 'lucide-react';
import AdminHeader from '../../components/layout/AdminHeader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalStudents: 0,
    totalEducators: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    pendingPayoutsCount: 0,
    pendingEducators: [],
    pendingCourses: [],
    pendingPayouts: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/admin/stats', config);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const kpis = [
    { 
      title: 'Active Students', 
      value: data.totalStudents, 
      icon: <Users size={24} />, 
      color: 'blue',
      label: 'ENROLLED USERS'
    },
    { 
      title: 'Verified Educators', 
      value: data.totalEducators, 
      icon: <ShieldCheck size={24} />, 
      color: 'indigo',
      label: 'TEACHING STAFF'
    },
    { 
      title: 'Published Courses', 
      value: data.totalCourses, 
      icon: <BookOpen size={24} />, 
      color: 'emerald',
      label: 'CONTENT LIBRARY'
    },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50/50', text: 'text-blue-600' },
    indigo: { bg: 'bg-indigo-50/50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50/50', text: 'text-emerald-600' }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans">
      <AdminHeader />
      
      <main className="max-w-[1440px] mx-auto px-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Dashboard Title & Platform Status */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[36px] font-bold text-slate-900 tracking-tight mb-2">Admin Command Center</h1>
            <p className="text-slate-500 font-medium tracking-tight text-[16px]">Monitor platform growth and manage institutional approvals.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Platform Status: Healthy</span>
          </div>
        </div>

        {/* 3 Premium Stats Cards - Redesigned with Median Blue UI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {kpis.map((kpi, index) => (
             <div key={index} className="bg-[#EFF6FF] p-8 rounded-[32px] border border-[#DBEAFE] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
                {/* Background Decorative Icon */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 text-slate-900">
                   {React.cloneElement(kpi.icon, { size: 140 })}
                </div>
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorMap[kpi.color].bg} ${colorMap[kpi.color].text} shadow-inner`}>
                      {kpi.icon}
                   </div>
                   <div>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{kpi.label}</p>
                   </div>
                </div>

                <div className="relative z-10">
                   <h3 className="text-5xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                   <div className="mt-4 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                      {kpi.title} <ArrowRight size={14} className="opacity-50" />
                   </div>
                </div>
             </div>
          ))}
        </div>

        {/* Management Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Educator Apps Queue */}
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
              <div className="p-8 pb-4 flex items-center justify-between">
                 <div>
                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Educator Applications</h2>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1">Pending Approval Queue</p>
                 </div>
                 <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">
                    {data.pendingEducators.length} Waiting
                 </div>
              </div>
              
              <div className="p-6 space-y-4 flex-grow overflow-y-auto max-h-[400px] custom-scrollbar">
                 {data.pendingEducators.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                       <UserPlus size={48} className="text-slate-300 mb-4" />
                       <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Queue is empty</p>
                    </div>
                 ) : (
                    data.pendingEducators.map((edu) => (
                       <div key={edu._id} className="p-5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-100 flex items-center justify-between transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-bold shadow-sm group-hover:scale-105 transition-transform">
                                {edu.name.charAt(0)}
                             </div>
                             <div>
                                <h4 className="text-[14px] font-bold text-slate-800 tracking-tight">{edu.name}</h4>
                                <p className="text-xs font-semibold text-slate-400">{edu.email}</p>
                             </div>
                          </div>
                          <Link 
                            to="/admin/educators"
                            className="w-10 h-10 flex items-center justify-center bg-white text-blue-600 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                          >
                            <ArrowRight size={18} />
                          </Link>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Course Approvals Queue */}
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
              <div className="p-8 pb-4 flex items-center justify-between">
                 <div>
                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Course Submissions</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Quality Review Required</p>
                 </div>
                 <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                    {data.pendingCourses.length} Waiting
                 </div>
              </div>

              <div className="p-6 space-y-4 flex-grow overflow-y-auto max-h-[400px] custom-scrollbar">
                 {data.pendingCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                       <BookCheck size={48} className="text-slate-300 mb-4" />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending courses</p>
                    </div>
                 ) : (
                    data.pendingCourses.map((course) => (
                       <div key={course._id} className="p-5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-100 flex items-center justify-between transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
                                <BookOpen size={20} />
                             </div>
                             <div>
                                <h4 className="text-[14px] font-bold text-slate-800 tracking-tight line-clamp-1">{course.title}</h4>
                                <p className="text-xs font-bold text-slate-400">By {course.educatorId?.name}</p>
                             </div>
                          </div>
                          <Link 
                            to="/admin/courses"
                            className="w-10 h-10 flex items-center justify-center bg-white text-blue-600 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                          >
                            <ArrowRight size={18} />
                          </Link>
                       </div>
                    ))
                 )}
              </div>
           </div>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
