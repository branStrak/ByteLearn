import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Play,
  Users,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Check,
  X,
  Mail
} from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [educatorName, setEducatorName] = useState('Educator');
  
  const [activeTab, setActiveTab] = useState('my-courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [profileRes, coursesRes, invitesRes] = await Promise.all([
        axios.get('/api/auth/profile', config),
        axios.get('/api/courses/my-courses', config),
        axios.get('/api/invites/my-invites', config)
      ]);

      setEducatorName(profileRes.data.name);

      const fetchedCourses = coursesRes.data?.data || coursesRes.data || [];
      setCourses(Array.isArray(fetchedCourses) ? fetchedCourses : []);

      const fetchedInvites = invitesRes.data?.data || [];
      setInvites(Array.isArray(fetchedInvites) ? fetchedInvites : []);

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondInvite = async (token, action) => {
    try {
      const jwtToken = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${jwtToken}` } };
      const res = await axios.patch(`/api/invites/${token}/${action}`, {}, config);
      toast.success(res.data.message || `Invitation ${action}ed successfully!`);
      fetchData();
      if (action === 'accept') {
        setActiveTab('my-courses');
      }
    } catch (err) {
      console.error(`Error ${action}ing invitation:`, err);
      toast.error(err.response?.data?.message || `Failed to ${action} invite`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course permanently? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(prev => prev.filter(c => c._id !== courseId));
      toast.success('Course deleted successfully');
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error('Failed to delete course');
    }
  };

  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    const title = course?.title || '';
    const status = course?.status || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <EducatorHeader educatorName={educatorName} activePage="/educator/courses" />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">My Courses</h1>
            <p className="text-slate-500">Manage all your courses—from blueprints to published content.</p>
          </div>
          <Link 
            to="/course/create"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            Create New Course
          </Link>
        </div>

        <div className="flex items-center gap-6 mb-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('my-courses')}
            className={`pb-4 px-2 font-bold text-sm transition-all relative ${
              activeTab === 'my-courses' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            My Courses
            {activeTab === 'my-courses' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('invites')}
            className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${
              activeTab === 'invites' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Collaboration Invites
            {invites.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
                {invites.length}
              </span>
            )}
            {activeTab === 'invites' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
          </button>
        </div>

        {activeTab === 'my-courses' ? (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search by course title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-medium"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-400 ml-2 mr-1" />
                <div className="flex gap-2">
                   {['All', 'Draft', 'Pending', 'Approved'].map((status) => (
                     <button
                       key={status}
                       onClick={() => setStatusFilter(status)}
                       className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                         statusFilter === status 
                         ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                         : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                       }`}
                     >
                       {status}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-28 w-full bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
             ))}
          </div>
        ) : error ? (
           <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
             <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
             <p className="text-slate-600 font-medium">{error}</p>
             <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 font-bold hover:underline">Try Refreshing</button>
           </div>
        ) : activeTab === 'my-courses' && filteredCourses.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-slate-300" size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">No courses found</h3>
             <p className="text-slate-500 mb-8 max-w-sm mx-auto">Get started by creating your first course blueprint or adjusting your filters.</p>
             <Link to="/course/create" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-1">
               Start Creating Now <ChevronRight size={18} />
             </Link>
          </div>
        ) : activeTab === 'my-courses' ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCourses.map((course) => {
              const courseId = course?._id || course?.id || Math.random().toString();
              const courseTitle = course?.title || 'Untitled Course';
              const courseCategory = course?.category || 'General';
              const coursePrice = course?.price || 0;
              const courseStatus = course?.status || 'draft';
              const courseThumbnail = course?.thumbnail || 'https://via.placeholder.com/400x225?text=Draft';
              const studentCount = (course?.enrolledStudents?.length) || (course?.studentCount) || 0;
              const moduleCount = (course?.modules?.length) || 0;

              return (
                <div 
                  key={courseId} 
                  className="group bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:bg-blue-50 transition-all flex flex-col md:flex-row items-center gap-6 cursor-default"
                >
                  <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                     <img 
                      src={courseThumbnail} 
                      alt={courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                     <div className="absolute top-2 right-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                          courseStatus === 'approved' ? 'bg-emerald-500 text-white border-emerald-400' :
                          courseStatus === 'pending' ? 'bg-amber-500 text-white border-amber-400' :
                          'bg-slate-700 text-white border-slate-600'
                        }`}>
                          {courseStatus}
                        </span>
                     </div>
                  </div>

                  <div className="flex-grow text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{courseTitle}</h2>
                        <span className="text-xs font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded hidden md:inline-block border border-slate-100 uppercase tracking-tighter">{courseCategory}</span>
                        {course.isOwner === false && course.educatorId?.name && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Owner: {course.educatorId.name}</span>
                        )}
                      </div>
                     <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                          <Play size={14} className="text-blue-500" />
                          <span>{moduleCount} Modules</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                          <Users size={14} className="text-emerald-500" />
                          <span>{studentCount} Students</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                           <span className="text-blue-600">{'\u20B9'}{coursePrice}</span>
                        </div>
                     </div>
                  </div>                  <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                     {courseStatus === 'draft' ? (
                       <button 
                         onClick={() => navigate(`/course/${courseId}/curriculum`)}
                         className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
                       >
                         <Edit3 size={18} />
                         Build Content
                       </button>
                     ) : (
                        <button 
                         onClick={() => navigate(`/course/${courseId}/curriculum`)}
                         className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95 whitespace-nowrap"
                       >
                         <Eye size={18} />
                         View Detail
                       </button>
                     )}
                     {course.isOwner !== false && (
                       <button 
                         onClick={() => handleDeleteCourse(course._id)}
                         className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                       >
                          <Trash2 size={18} />
                       </button>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Invitations Tab Content */
          <div className="space-y-4">
            {invites.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-slate-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="text-blue-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No pending invitations</h3>
                <p className="text-slate-500 mb-0 max-w-sm mx-auto">When other educators invite you to collaborate, they'll appear here.</p>
              </div>
            ) : (
              invites.map((invite) => (
                <div 
                  key={invite._id} 
                  className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xl uppercase ring-4 ring-white shadow-sm">
                    {invite.invitedBy?.name?.charAt(0) || 'E'}
                  </div>

                  <div className="flex-grow text-center md:text-left">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Collaboration Invite</p>
                    <h2 className="text-lg font-bold text-slate-800 mb-1">
                      {invite.invitedBy?.name} invited you to co-instruct:
                    </h2>
                    <p className="text-slate-600 font-medium">{invite.courseId?.title}</p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide font-bold">
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleRespondInvite(invite.token, 'accept')}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <Check size={18} />
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRespondInvite(invite.token, 'decline')}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 text-slate-500 font-bold rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                    >
                      <X size={18} />
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;
