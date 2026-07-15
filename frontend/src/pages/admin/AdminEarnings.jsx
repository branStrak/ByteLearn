import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  BookOpen, 
  Users,
  Search,
  LayoutDashboard,
  Filter,
  ArrowDownToLine
} from 'lucide-react';
import AdminHeader from '../../components/layout/AdminHeader';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AdminEarnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalEarnings: 0,
    courseEarnings: [],
    recentEnrollments: [],
    chartData: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAdminEarnings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/admin/earnings', config);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Error fetching admin earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminEarnings();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <AdminHeader />
        <div className="max-w-[1440px] mx-auto px-10 py-10">
          <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-xl mb-4"></div>
          <div className="h-5 w-96 bg-slate-200 animate-pulse rounded-lg mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-[32px]"></div>)}
          </div>
          <div className="h-[450px] bg-slate-200 animate-pulse rounded-[32px] mb-12"></div>
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Gross Platform Revenue', 
      value: data.grossRevenue || 0, 
      icon: <TrendingUp size={24} />, 
      color: 'blue'
    },
    { 
      label: 'Platform Profit (20%)', 
      value: data.totalEarnings || 0, 
      icon: <IndianRupee size={24} />, 
      color: 'indigo'
    },
    { 
      label: 'Monetized Courses', 
      value: data.courseEarnings.length, 
      icon: <BookOpen size={24} />, 
      color: 'emerald'
    },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50/50', text: 'text-blue-600', accent: 'text-blue-400' },
    indigo: { bg: 'bg-indigo-50/50', text: 'text-indigo-600', accent: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-50/50', text: 'text-emerald-600', accent: 'text-emerald-400' }
  };

  const filteredEnrollments = data.recentEnrollments.filter(enrollment => 
    enrollment.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans">
      <AdminHeader activePage="/admin/earnings" />
      
      <motion.main 
        className="max-w-[1440px] mx-auto px-10 py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[36px] font-bold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
              Financial Intelligence <LayoutDashboard className="text-blue-600" size={32} />
            </h1>
            <p className="text-slate-500 font-medium tracking-tight text-[16px]">Monitoring platform revenue share (20% commission) and sales performance.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-700 uppercase tracking-widest">
                <ArrowDownToLine size={16} className="text-blue-600" /> Export Report
             </button>
          </div>
        </div>

        {/* KPI Row - Redesigned with Median Blue UI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-[#EFF6FF] p-8 rounded-[32px] border border-[#DBEAFE] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
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
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline">
                     {kpi.label.includes('Revenue') || kpi.label.includes('Profit') ? (
                       <>
                         <span className="text-2xl font-bold text-slate-400 mr-1.5">₹</span>
                         {kpi.value.toLocaleString('en-IN')}
                       </>
                     ) : (
                       kpi.value
                     )}
                  </h3>
               </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm mb-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Revenue Growth</h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Monthly Financial Progression</p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest">Last 12 Months</button>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            {data.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                    tickFormatter={(value) => `₹${value}`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                      backgroundColor: '#1e293b',
                      padding: '20px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 700, fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'ADMIN PROFIT']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 10, strokeWidth: 4, stroke: '#fff', fill: '#2563eb shadow-xl' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                 <Calendar size={48} className="text-slate-300 mb-4" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Waiting for more financial data</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           
           {/* Course Earnings Table */}
           <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 pb-4 flex items-center justify-between">
                 <div>
                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Course Revenue Share</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Top Performing Content</p>
                 </div>
                 <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    {data.courseEarnings.length} Courses
                 </div>
              </div>
              
              <div className="p-4 flex-grow overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="text-left border-b border-slate-100">
                          <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Title</th>
                          <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sales</th>
                          <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {data.courseEarnings.length > 0 ? (
                          data.courseEarnings.map((course) => (
                             <tr key={course._id} className="group hover:bg-slate-50 transition-all">
                                <td className="px-4 py-5">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                                         {course.courseTitle.charAt(0)}
                                      </div>
                                      <span className="text-sm font-bold text-slate-700 line-clamp-1">{course.courseTitle}</span>
                                   </div>
                                </td>
                                <td className="px-4 py-5 text-center">
                                   <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{course.enrollmentCount}</span>
                                </td>
                                <td className="px-4 py-5 text-right font-black text-slate-900">
                                   ₹{course.totalEarned.toLocaleString('en-IN')}
                                </td>
                             </tr>
                          ))
                       ) : (
                          <tr>
                             <td colSpan="3" className="py-20 text-center opacity-40">
                                <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-xs font-bold uppercase tracking-widest">No course revenue yet</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Individual Enrollments Table */}
           <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 pb-4 flex items-center justify-between">
                 <div>
                    <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Recent Enrollments</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Transaction Feed</p>
                 </div>
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                       type="text" 
                       placeholder="SEARCH FEED..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all w-40"
                    />
                 </div>
              </div>
              
              <div className="p-4 flex-grow overflow-x-auto max-h-[500px] custom-scrollbar">
                 <table className="w-full">
                    <thead>
                       <tr className="text-left border-b border-slate-100">
                          <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student / Course</th>
                          <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Date</th>
                          <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredEnrollments.length > 0 ? (
                          filteredEnrollments.map((enrollment) => (
                             <tr key={enrollment._id} className="group hover:bg-slate-50 transition-all">
                                <td className="px-4 py-5">
                                   <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-800">{enrollment.studentId?.name}</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight line-clamp-1">{enrollment.courseId?.title}</span>
                                   </div>
                                </td>
                                <td className="px-4 py-5 text-center">
                                   <span className="text-[10px] font-bold text-slate-500">{new Date(enrollment.paidAt).toLocaleDateString()}</span>
                                </td>
                                <td className="px-4 py-5 text-right font-black text-emerald-600">
                                   +₹{enrollment.amount.toLocaleString('en-IN')}
                                </td>
                             </tr>
                          ))
                       ) : (
                          <tr>
                             <td colSpan="3" className="py-20 text-center opacity-40">
                                <Users size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-xs font-bold uppercase tracking-widest">No recent transactions</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

      </motion.main>
    </div>
  );
};

export default AdminEarnings;
