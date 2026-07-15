import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookCheck,
  XCircle,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Tag,
  BarChart2,
  Globe,
  IndianRupee,
  User,
  FileText,
  AlertCircle
} from 'lucide-react';
import AdminHeader from '../../components/layout/AdminHeader';

const CourseApprovals = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/courses/pending', config);
      setCourses(res.data.courses);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    if (status === 'rejected' && !feedback.trim()) {
      alert("Feedback is required for rejection.");
      return;
    }
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/courses/${id}/review`, { status, adminFeedback: feedback }, config);
      alert(`Course ${status === 'approved' ? 'Published' : 'Rejected'} Successfully!`);
      setSelectedCourse(null);
      setFeedback('');
      fetchPendingCourses();
    } catch (err) {
      console.error("Review error:", err);
      alert("Failed to review course.");
    } finally {
      setIsProcessing(false);
    }
  };

  const levelColor = {
    Beginner: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Intermediate: 'bg-amber-50 text-amber-600 border-amber-100',
    Advanced: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const InfoBadge = ({ icon, label, value, color = 'bg-slate-50 text-slate-600 border-slate-100' }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${color}`}>
      {icon}
      <span className="text-slate-400 font-medium">{label}:</span>
      <span>{value || '—'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <AdminHeader />

      <main className="max-w-[1440px] mx-auto px-10 py-10">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-[32px] font-black text-slate-800 tracking-tighter mb-1">Course Approvals</h1>
            <p className="text-slate-500 font-medium tracking-tight">Curate and verify the latest learning content submissions.</p>
          </div>
          {!loading && courses.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
              <Clock size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-600">{courses.length} course{courses.length > 1 ? 's' : ''} awaiting review</span>
            </div>
          )}
        </div>

        {/* Course List */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white p-20 rounded-[32px] border border-slate-100 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <BookCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No pending courses for review</h3>
            <p className="text-sm text-slate-400 font-medium">All submissions have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6 group"
              >
                {/* Thumbnail */}
                <div className="w-40 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-50">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <BookCheck size={28} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-1">{course.title}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-slate-400">By {course.educatorId?.name || 'Unknown'}</span>
                    {course.category && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                        {course.category}
                      </span>
                    )}
                    {course.level && (
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg border ${levelColor[course.level] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {course.level}
                      </span>
                    )}
                    {course.isPaid ? (
                      <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-violet-100">
                        ₹{course.price}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                        Free
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-95 shrink-0"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 sm:p-10">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative">

              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                    {selectedCourse.thumbnail ? (
                      <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookCheck size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{selectedCourse.title}</h2>
                    <p className="text-sm font-medium text-slate-400">
                      By <span className="text-slate-600 font-bold">{selectedCourse.educatorId?.name || 'Unknown Educator'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedCourse(null); setFeedback(''); }}
                  className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 hover:rotate-90 transition-all"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-grow overflow-y-auto p-10 space-y-10 bg-white">

                {/* Course Overview Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="h-px flex-grow bg-slate-100" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 whitespace-nowrap">Course Overview</span>
                    <div className="h-px flex-grow bg-slate-100" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Tag size={12} className="text-blue-500" /> Category</p>
                       <p className="text-sm font-bold text-slate-700">{selectedCourse.category}</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><BarChart2 size={12} className="text-amber-500" /> Difficulty</p>
                       <p className="text-sm font-bold text-slate-700">{selectedCourse.level}</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Globe size={12} className="text-indigo-500" /> Language</p>
                       <p className="text-sm font-bold text-slate-700">{selectedCourse.language || 'English'}</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><IndianRupee size={12} className="text-emerald-500" /> Pricing</p>
                       <p className="text-sm font-bold text-slate-700">{selectedCourse.isPaid ? `₹${selectedCourse.price}` : 'Free Course'}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-slate-400">
                    <div className="h-px flex-grow bg-slate-100" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 whitespace-nowrap">Content Description</span>
                    <div className="h-px flex-grow bg-slate-100" />
                  </div>
                  <div className="p-8 bg-slate-50/30 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[15px] text-slate-600 font-medium leading-relaxed">
                      {selectedCourse.description || <span className="text-slate-300 italic">No detailed description provided for this course.</span>}
                    </p>
                  </div>
                </div>

                {/* Review Feedback */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="h-px flex-grow bg-slate-100" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 whitespace-nowrap">Review Feedback</span>
                    <div className="h-px flex-grow bg-slate-100" />
                  </div>
                  <div className="relative group">
                    <textarea
                      rows="4"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-3xl p-6 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 focus:bg-white transition-all text-slate-700 font-medium placeholder:text-slate-300 text-[15px] resize-none"
                      placeholder="Enter internal notes or feedback for the educator (Required only if rejecting)..."
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-2 gap-6 sticky bottom-0 z-10">
                <button
                  onClick={() => handleReview(selectedCourse._id, 'rejected')}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  <XCircle size={18} /> Send Correction
                </button>
                <button
                  onClick={() => handleReview(selectedCourse._id, 'approved')}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Publish Course
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CourseApprovals;
