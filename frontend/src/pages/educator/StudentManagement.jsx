import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  ClipboardCheck, 
  Search, 
  Filter, 
  ArrowRight,
  UserCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Target,
  Zap,
  Download,
  MoreHorizontal,
  Mail,
  AlertTriangle,
  TrendingUp,
  Trophy,
  RefreshCw
} from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';
import Footer from '../../components/layout/Footer';

const StudentManagement = () => {
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get('courseId');
  
  const [activeTab, setActiveTab] = useState(courseIdParam ? 'roster' : 'grading'); // 'grading' or 'roster'
  const [educatorName, setEducatorName] = useState('Educator');
  const [loading, setLoading] = useState(true);
  
  // States for Grading Queue
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  
  // States for Course Roster
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseIdParam || ''); // Set from URL if present
  const [roster, setRoster] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Student Detail Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
  const [enrollmentDetail, setEnrollmentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const profileRes = await axios.get('/api/auth/profile', config);
        setEducatorName(profileRes.data.name);
        
        // Fetch pending work
        try {
            const subRes = await axios.get('/api/submissions/educator', config);
            setPendingSubmissions(subRes.data);
            
            const rosterRes = await axios.get('/api/enrollments/educator/roster', config);
            setRoster(rosterRes.data.data);

            const coursesRes = await axios.get('/api/courses/my-courses', config);
            setCourses(coursesRes.data.data);
        } catch (e) {
            console.error("Error fetching submissions, roster or courses:", e);
        }
        
      } catch (err) {
        console.error("Error fetching educator profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchEnrollmentDetail = async (id) => {
    try {
      setDetailLoading(true);
      setIsDrawerOpen(true);
      setSelectedEnrollmentId(id);
      
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/enrollments/educator/enrollment/${id}`, config);
      setEnrollmentDetail(res.data.data);
    } catch (err) {
      console.error("Error fetching enrollment detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredRoster = roster
    .filter(enrollment => {
        const studentName = enrollment.studentId?.name || '';
        const studentIdStr = enrollment.studentId?._id || '';
        const courseIdStr = enrollment.courseId?._id || '';
        
        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            studentIdStr.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCourse = selectedCourse === '' || courseIdStr === selectedCourse;
        
        return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
        const aLastActive = new Date(a.performance?.lastActive || a.updatedAt);
        const bLastActive = new Date(b.performance?.lastActive || b.updatedAt);
        const aInactive = Math.floor((new Date() - aLastActive) / (1000 * 60 * 60 * 24)) >= 7;
        const bInactive = Math.floor((new Date() - bLastActive) / (1000 * 60 * 60 * 24)) >= 7;
        
        const aLowGrade = a.performance?.liveGrade !== null && a.performance?.liveGrade < 60; // Using 60 as risk threshold
        const bLowGrade = b.performance?.liveGrade !== null && b.performance?.liveGrade < 60;
        
        const aAtRisk = aInactive || aLowGrade;
        const bAtRisk = bInactive || bLowGrade;
        
        if (aAtRisk && !bAtRisk) return -1;
        if (!aAtRisk && bAtRisk) return 1;
        return 0; // Maintain relative order for same risk status
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <EducatorHeader educatorName={educatorName} activePage="/educator/student-management" />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Student Management Hub</h1>
          <p className="text-slate-500">The central control center for tracking progress and grading student work.</p>
        </div>

        {/* Tab Switcher & Global Filter - High-end control center style */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2 w-fit">
            <button
              onClick={() => setActiveTab('grading')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'grading' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <ClipboardCheck size={18} />
              Grading Queue
              <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'grading' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {pendingSubmissions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'roster' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Users size={18} />
              Course Roster
              <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'roster' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {roster.length}
              </span>
            </button>
          </div>

          {/* Global Course Filter */}
          <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl shadow-sm border border-slate-200 min-w-[320px]">
             <div className="flex items-center gap-2 text-blue-600 shrink-0">
                <Filter size={16} className="opacity-70" />
                <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
             </div>
             <div className="h-6 w-px bg-slate-100 mx-1" />
             <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 cursor-pointer h-9 py-0"
             >
                <option value="">All Active Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
             </select>
          </div>
        </div>

        {/* Dynamic View Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {loading ? (
             <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
                <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Syncing data...</p>
             </div>
          ) : activeTab === 'grading' ? (
            <GradingQueueView submissions={pendingSubmissions.filter(s => !selectedCourse || s.courseId?._id === selectedCourse)} />
          ) : (
            <CourseRosterView 
              roster={filteredRoster} 
              courses={courses}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              totalCount={filteredRoster.length}
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              onViewDetail={fetchEnrollmentDetail}
            />
          )}
        </div>

        {/* Student Detail Drawer */}
        <StudentDetailDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => {
            setIsDrawerOpen(false);
            setEnrollmentDetail(null);
          }}
          detail={enrollmentDetail}
          loading={detailLoading}
        />
      </main>
      <Footer />
    </div>
  );
};

/* --- Sub-View: Grading Queue --- */
const GradingQueueView = ({ submissions }) => {
  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 text-center py-24">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="text-blue-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Queue is Empty</h3>
          <p className="text-slate-500 max-w-md mx-auto">All student assignments are currently graded. You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Course Name</th>
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Assignment Name</th>
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Submitted On</th>
            <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {submissions.map((sub) => (
            <tr key={sub._id} className="hover:bg-blue-50 transition-colors group cursor-default">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {sub.studentId?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{sub.studentId?.name || 'Unknown Student'}</p>
                    <p className="text-[11px] text-slate-400">{sub.studentId?.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <p className="text-sm font-semibold text-slate-600 line-clamp-1">{sub.courseId?.title}</p>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{sub.assignmentId?.title}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                    {Math.floor((new Date() - new Date(sub.submittedAt)) / (1000 * 60 * 60 * 24))} Days Pending
                  </p>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <button 
                  onClick={() => window.location.href=`/educator/review/${sub._id}`}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-100 inline-flex items-center gap-2"
                >
                  Grade Submission <ArrowRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* --- Sub-View: Course Roster --- */
const CourseRosterView = ({ roster, courses, selectedCourse, setSelectedCourse, totalCount, searchTerm, setSearchTerm, onViewDetail }) => {
  // Calculate Class Metrics
  const courseStudents = roster.filter(r => !selectedCourse || r.courseId?._id === selectedCourse);
  const classAvgValid = courseStudents.filter(r => r.performance?.liveGrade !== null && r.performance?.liveGrade !== undefined);
  const classAvg = classAvgValid.length > 0
    ? Math.round(classAvgValid.reduce((acc, curr) => acc + curr.performance.liveGrade, 0) / classAvgValid.length)
    : 0;
  const completionCount = courseStudents.filter(r => r.progressPercentage === 100).length;
  const completionRate = courseStudents.length > 0 
    ? Math.round((completionCount / courseStudents.length) * 100)
    : 0;

  const handleExportCSV = () => {
    // CSV Header
    const headers = ["Student Name", "Email", "Course", "Progress %", "Weighted Grade", "Status", "Last Active"];
    
    // CSV Rows
    const rows = courseStudents.map(s => {
        const lastActive = new Date(s.performance?.lastActive || s.updatedAt);
        const diffDays = Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24));
        const hasLiveGrade = s.performance?.liveGrade !== null && s.performance?.liveGrade !== undefined;
        let status = "Not Started";
        if (diffDays >= 7) status = "At Risk (Inactive)";
        else if (hasLiveGrade && s.performance.liveGrade < 60) status = "At Risk (Low Grade)";
        else if (hasLiveGrade && s.performance.liveGrade >= 75) status = "Passing";
        else if (hasLiveGrade) status = "Borderline";
        else if (s.progressPercentage > 0) status = "In Progress";
        else status = "Not Started";
        
        return [
            `"${s.studentId?.name || 'Unknown'}"`,
            `"${s.studentId?.email || 'N/A'}"`,
            `"${s.courseId?.title || 'N/A'}"`,
            `${s.progressPercentage}%`,
            `${hasLiveGrade ? s.performance.liveGrade + '%' : 'N/A'}`,
            `"${status}"`,
            `"${diffDays === 0 ? 'Today' : diffDays + ' days ago'}"`
        ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `roster_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Summary Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 text-white">
               <Users size={80} />
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-2xl flex items-center justify-center relative z-10">
               <Users size={24} />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">Total Enrolled</p>
               <h3 className="text-3xl font-black text-white">{courseStudents.length} Students</h3>
            </div>
         </div>
         
         <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 text-white">
               <Target size={80} />
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-2xl flex items-center justify-center relative z-10">
               <Target size={24} />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">Class Avg Grade</p>
               <h3 className="text-3xl font-black text-white">{classAvg}% Score</h3>
            </div>
         </div>

         <div className="bg-gradient-to-br from-indigo-500 to-purple-700 p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 text-white">
               <Zap size={80} />
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-2xl flex items-center justify-center relative z-10">
               <Zap size={24} />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">Completion Rate</p>
               <h3 className="text-3xl font-black text-white">{completionRate}% Done</h3>
            </div>
         </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 pr-10 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-grow w-full">
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1 block tracking-widest">Search Student</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="md:mt-5">
           <button 
             onClick={handleExportCSV}
             className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all border border-slate-900 h-[50px]"
           >
            <Download size={18} />
            Export List
          </button>
        </div>
      </div>

      {/* Roster Table Content */}
      {roster.length === 0 ? (
         <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-20 text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-blue-100/50">
               <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No Students Enrolled Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">Once students enroll in your courses, they will appear here in the global roster. You can filter by specific courses using the menu above.</p>
         </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
          {roster.length === 0 ? (
           <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                 <Users className="text-slate-300" size={24} />
              </div>
              <p className="text-slate-500 font-bold">No students found</p>
              <p className="text-slate-400 text-sm">Either no students are enrolled in this course or your search is too specific.</p>
           </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Course & Progress</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Live Grade</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roster.map((enrollment) => {
                const lastActive = new Date(enrollment.performance?.lastActive || enrollment.updatedAt);
                const diffDays = Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24));
                const isInactive = diffDays >= 7;

                return (
                  <tr key={enrollment._id} className="hover:bg-blue-50 transition-colors group cursor-default">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={enrollment.studentId?.profilePicture?.startsWith('http') ? enrollment.studentId?.profilePicture : `http://localhost:5000/uploads/${enrollment.studentId?.profilePicture}`} 
                            alt={enrollment.studentId?.name}
                            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.studentId?.name || 'S')}&background=E0E7FF&color=4338CA&bold=true`;
                            }}
                          />
                          {!isInactive && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{enrollment.studentId?.name || 'Unknown Student'}</p>
                          <p className="text-[11px] font-medium text-slate-400">{enrollment.studentId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       {isInactive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                             At Risk (Inactive)
                          </span>
                       ) : enrollment.performance?.liveGrade === null || enrollment.performance?.liveGrade === undefined ? (
                          enrollment.progressPercentage > 0 ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                In Progress
                             </span>
                          ) : (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Not Started
                             </span>
                          )
                       ) : enrollment.performance?.liveGrade >= 75 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             Passing
                          </span>
                       ) : enrollment.performance?.liveGrade >= 60 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                             Borderline
                          </span>
                       ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                             At Risk (Low Grade)
                          </span>
                       )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                           <BookOpen size={14} className="text-blue-500 flex-shrink-0" />
                           <span className="text-xs font-bold text-slate-700 line-clamp-1" title={enrollment.courseId?.title}>{enrollment.courseId?.title || 'Unknown Course'}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content Completion</span>
                            <span className="text-xs font-black text-slate-700">{enrollment.progressPercentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                               className={`h-full rounded-full transition-all duration-1000 shadow-sm ${
                                  enrollment.progressPercentage === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                               }`} 
                               style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                         <div className={`text-lg font-black ${
                            enrollment.performance?.liveGrade === null || enrollment.performance?.liveGrade === undefined ? 'text-slate-400' :
                            enrollment.performance?.liveGrade >= 75 ? 'text-emerald-600' : 
                            enrollment.performance?.liveGrade >= 60 ? 'text-amber-500' : 'text-rose-500'
                         }`}>
                            {enrollment.performance?.liveGrade === null || enrollment.performance?.liveGrade === undefined ? '--' : enrollment.performance?.liveGrade}%
                         </div>
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Weighted Avg</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           {isInactive ? (
                              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                           ) : (
                              <Clock size={14} className="text-slate-400" />
                           )}
                           <span className={`text-xs font-bold ${isInactive ? 'text-rose-500' : 'text-slate-600'}`}>
                              {diffDays === 0 ? 'Active Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`}
                           </span>
                        </div>
                        {isInactive && (
                           <span className="text-[10px] font-bold text-rose-400/80 mt-1">Needs Attention</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => onViewDetail(enrollment._id)}
                        className="px-4 py-2 bg-white text-slate-600 hover:text-blue-600 rounded-xl font-bold text-xs transition-all border border-slate-100 hover:border-blue-100 hover:shadow-sm inline-flex items-center gap-2"
                      >
                        Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        
        <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Total Enrolled Students: {totalCount}
            </p>
        </div>
        </div>
      )}
    </div>
  );
};

/* --- Sub-View: Student Detail Drawer --- */
const StudentDetailDrawer = ({ isOpen, onClose, detail, loading }) => {
  const [activeTab, setActiveTab] = useState('performance'); // 'performance' or 'history'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-[540px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] animate-in slide-in-from-right duration-500 ease-out flex flex-col">
        
        {/* Header */}
        <div className="px-10 pt-10 pb-8 relative">
           <div className="flex items-center justify-between mb-10">
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
              >
                 <ChevronRight className="rotate-180" size={20} />
              </button>
              <button className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100/50">
                Export Profile
              </button>
           </div>

           {loading ? (
              <div className="animate-pulse flex items-center gap-6">
                 <div className="w-24 h-24 bg-slate-100 rounded-[2rem]" />
                 <div className="space-y-4">
                    <div className="w-56 h-8 bg-slate-100 rounded-xl" />
                    <div className="w-40 h-5 bg-slate-100 rounded-xl" />
                 </div>
              </div>
           ) : (
             <div className="flex items-center gap-7">
                <div className="relative group">
                   <img 
                      src={detail?.enrollment?.studentId?.profilePicture?.startsWith('http') ? detail?.enrollment?.studentId?.profilePicture : `http://localhost:5000/uploads/${detail?.enrollment?.studentId?.profilePicture}`}
                      className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-blue-50/50 shadow-xl shadow-blue-100/20 group-hover:scale-105 transition-transform duration-500"
                      alt="Student"
                      onError={(e) => {
                         e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(detail?.enrollment?.studentId?.name || 'S')}&background=E0E7FF&color=4338CA&bold=true`;
                      }}
                   />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{detail?.enrollment?.studentId?.name}</h2>
                   <p className="text-slate-400 font-bold text-sm mb-4 tracking-tight">{detail?.enrollment?.studentId?.email}</p>
                   <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     Verified Student
                   </span>
                </div>
             </div>
           )}
        </div>

        {/* Tab Selection */}
        <div className="px-10 flex gap-8 text-[11px] font-black uppercase tracking-widest">
           <button 
             onClick={() => setActiveTab('performance')}
             className={`pb-5 border-b-2 transition-all ${activeTab === 'performance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
           >
              Performance Overview
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`pb-5 border-b-2 transition-all ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
           >
              Activity Timeline
           </button>
        </div>

        <div className="h-px w-full bg-slate-100" />

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-10 bg-slate-50/40 custom-scrollbar">
           {loading ? (
              <div className="space-y-8">
                 {[1,2,3].map(i => <div key={i} className="w-full h-40 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />)}
              </div>
           ) : activeTab === 'performance' ? (
              <PerformanceBreakdown detail={detail} />
           ) : (
              <ActivityTimeline timeline={detail?.timeline} />
           )}
        </div>

        {/* Smart Academic Nudge Action Bar */}
        <SmartNudgeBar detail={detail} />
      </div>
    </div>
  );
};

/* --- Detailed Breakdown Views --- */
const PerformanceBreakdown = ({ detail }) => {
  return (
    <div className="space-y-12">
      {/* Quiz Section */}
      <div>
         <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
               <GraduationCap size={18} className="text-blue-500" />
               Academic Performance
            </h4>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">{detail?.quizAttempts?.length} Tests</span>
         </div>
         <div className="grid gap-4">
            {detail?.quizAttempts?.map((attempt) => (
               <div key={attempt._id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-xl hover:shadow-blue-900/5 transition-all group duration-500">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                        Q
                     </div>
                     <div>
                        <p className="text-md font-black text-slate-700 leading-tight mb-1">{attempt.quizId?.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed {new Date(attempt.submittedAt).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className={`text-xl font-black ${attempt.score / attempt.totalMarksPossible >= 0.7 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {attempt.score}/{attempt.totalMarksPossible}
                     </div>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Final Score</p>
                  </div>
               </div>
            ))}
            {detail?.quizAttempts?.length === 0 && (
               <p className="text-xs text-slate-400 font-bold text-center py-8 bg-white/50 rounded-[2rem] border border-dashed border-slate-200 uppercase tracking-widest">No quiz data available</p>
            )}
         </div>
      </div>

      {/* Assignment Section */}
      <div>
         <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
               <ClipboardCheck size={18} className="text-indigo-500" />
               Project Submissions
            </h4>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">{detail?.submissions?.length} Items</span>
         </div>
         <div className="grid gap-4">
            {detail?.submissions?.map((sub) => (
               <div key={sub._id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-500">
                  <div className="flex items-center justify-between mb-5">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center font-black">
                           A
                        </div>
                        <p className="text-md font-black text-slate-700">{sub.assignmentId?.title}</p>
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {sub.status}
                     </span>
                  </div>
                  {sub.status === 'graded' ? (
                     <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                           <span>Evaluated Score</span>
                           <span className="text-slate-800 font-black">{sub.marksObtained} / {sub.assignmentId?.totalMarks}</span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                           "{sub.feedback || 'No written feedback provided'}"
                        </div>
                     </div>
                  ) : (
                     <button className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                        Begin Evaluation
                     </button>
                  )}
               </div>
            ))}
            {detail?.submissions?.length === 0 && (
               <p className="text-xs text-slate-400 font-bold text-center py-8 bg-white/50 rounded-[2rem] border border-dashed border-slate-200 uppercase tracking-widest">No submissions yet</p>
            )}
         </div>
      </div>
    </div>
  );
};

const ActivityTimeline = ({ timeline }) => {
  return (
    <div className="relative pl-6 space-y-10">
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100" />
      {timeline?.map((item, idx) => (
        <div key={idx} className="relative">
          <div className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10 ${item.type === 'quiz' ? 'bg-blue-500' : 'bg-indigo-500'}`} />
          <div>
            <div className="flex items-center justify-between mb-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
               <span className="text-[10px] font-bold text-slate-500">{item.type}</span>
            </div>
            <h5 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h5>
            <p className="text-xs text-slate-400">{item.meta}</p>
          </div>
        </div>
      ))}
      {(!timeline || timeline.length === 0) && (
         <div className="text-center py-10">
            <Clock size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-bold">No activity recorded yet</p>
         </div>
      )}
    </div>
  );
};

/* --- Smart Academic Nudge Bar --- */
const SmartNudgeBar = ({ detail }) => {
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');

  const grade = detail?.enrollment?.performance?.liveGrade;
  const lastActive = detail?.enrollment?.performance?.lastActive || detail?.enrollment?.updatedAt;
  const rawDiffDays = lastActive ? Math.floor((new Date() - new Date(lastActive)) / (1000 * 60 * 60 * 24)) : null;
  const diffDays = rawDiffDays !== null ? rawDiffDays : 0;
  const diffDaysLabel = rawDiffDays === null ? 'Unknown' : diffDays === 0 ? 'Today' : `${diffDays} days ago`;
  const studentName = detail?.enrollment?.studentId?.name || 'Student';
  const studentEmail = detail?.enrollment?.studentId?.email || '';
  const courseName = detail?.enrollment?.courseId?.title || 'your course';

  // Determine student status
  const isInactive = rawDiffDays === null || diffDays >= 7;
  const isTopPerformer = !isInactive && grade !== null && grade !== undefined && grade >= 75;
  const isNeedsAttention = !isInactive && grade !== null && grade !== undefined && grade >= 60 && grade < 75;

  let nudgeConfig = {};

    if (isInactive) {
    nudgeConfig = {
      type: 'inactive',
      status: 'Inactive',
      label: 'Request Participation',
      sublabel: `Last active: ${diffDaysLabel}`,
      icon: <RefreshCw size={16} />,
      color: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      badgeDot: 'bg-indigo-400',
    };
  } else if (isTopPerformer) {
    nudgeConfig = {
      type: 'top_performer',
      status: 'Excellent Performance',
      label: 'Acknowledge Excellence',
      sublabel: `${grade}% — Outstanding Achievement`,
      icon: <Trophy size={16} />,
      color: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeDot: 'bg-blue-500',
    };
  } else if (isNeedsAttention) {
    nudgeConfig = {
      type: 'needs_attention',
      status: 'Academic Check-in',
      label: 'Send Progress Update',
      sublabel: `${grade}% — Performance is Stable`,
      icon: <TrendingUp size={16} />,
      color: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      badgeDot: 'bg-amber-400',
    };
  } else {
    nudgeConfig = {
      type: 'at_risk',
      status: 'Academic Risk',
      label: 'Send Progress Warning',
      sublabel: grade !== null && grade !== undefined ? `${grade}% — Urgent Review Required` : 'Initial Evaluation Pending',
      icon: <AlertTriangle size={16} />,
      color: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeDot: 'bg-rose-500',
    };
  }

  const handleSendNudge = async () => {
    if (!studentEmail) return;
    setSending(true);
    setError('');
    setSent(false);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/communication/send-progress-email',
        {
          studentEmail,
          studentName,
          type: nudgeConfig.type,
          grade,
          courseName,
          daysInactive: diffDays,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError('Failed to send email. Please try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border-t border-slate-100 p-6 space-y-3">
      {/* Status Banner */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${nudgeConfig.badgeBg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${nudgeConfig.badgeDot}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${nudgeConfig.badgeText}`}>
            Student Status
          </span>
        </div>
        <span className={`text-[11px] font-black ${nudgeConfig.badgeText}`}>
          {nudgeConfig.status} — {nudgeConfig.sublabel}
        </span>
      </div>

      {/* Feedback messages */}
      {sent && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl">
          <Mail size={14} /> Email sent to {studentEmail} successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold px-4 py-3 rounded-xl">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleSendNudge}
        disabled={!studentEmail || sending || sent}
        className={`w-full py-4 text-white rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed ${nudgeConfig.color}`}
      >
        {sending ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Sending Email...
          </>
        ) : sent ? (
          <>
            <Mail size={16} />
            Email Sent!
          </>
        ) : (
          <>
            {nudgeConfig.icon}
            {nudgeConfig.label}
            <Mail size={16} className="ml-1 opacity-70" />
          </>
        )}
      </button>

      {!studentEmail && (
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          No email address on file for this student
        </p>
      )}
    </div>
  );
};

export default StudentManagement;
