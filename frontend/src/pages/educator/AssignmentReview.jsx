import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  FileText, 
  Clock, 
  User, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ArrowLeft
} from 'lucide-react';

const AssignmentReview = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    
    // For navigation
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                // Fetch current submission details
                const subRes = await axios.get(`/api/submissions/${submissionId}`, config);
                setSubmission(subRes.data);
                setMarks(subRes.data.marksObtained || '');
                setFeedback(subRes.data.feedback || '');
                
                // Fetch full queue to support Prev/Next navigation
                const queueRes = await axios.get('/api/submissions/educator', config);
                setQueue(queueRes.data);
                
                const idx = queueRes.data.findIndex(item => item._id === submissionId);
                setCurrentIndex(idx);
                
            } catch (err) {
                console.error("Error fetching review data:", err);
                setError(err.response?.data?.message || "Failed to load submission");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [submissionId]);

    const handleSubmitGrade = async (e) => {
        e.preventDefault();
        if (marks > submission.assignmentId.totalMarks) {
            alert(`Marks cannot exceed ${submission.assignmentId.totalMarks}`);
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.put(`/api/submissions/${submissionId}/grade`, {
                marksObtained: Number(marks),
                feedback
            }, config);
            
            // Show success and move to next or go back
            if (currentIndex < queue.length - 1) {
                const nextId = queue[currentIndex + 1]._id;
                navigate(`/educator/review/${nextId}`);
            } else {
                alert("All pending submissions in this batch have been graded!");
                navigate('/educator/student-management');
            }
        } catch (err) {
            console.error("Error grading submission:", err);
            alert("Failed to save grade");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNavigate = (direction) => {
        if (direction === 'next' && currentIndex < queue.length - 1) {
            navigate(`/educator/review/${queue[currentIndex + 1]._id}`);
        } else if (direction === 'prev' && currentIndex > 0) {
            navigate(`/educator/review/${queue[currentIndex - 1]._id}`);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Review Portal...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl max-w-md text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-500 mb-8 font-medium">{error}</p>
                <button onClick={() => navigate(-1)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        </div>
    );

    const isImage = submission.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const isPDF = submission.fileUrl.match(/\.(pdf)$/i);

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            
            {/* Header: Student & Assignment Info */}
            <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/educator/student-management')}
                        className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-[1px] h-10 bg-slate-100" />
                    <div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">
                            {submission.studentId.name}
                        </h1>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                           <span className="flex items-center gap-1"><BookOpen size={12} /> {submission.courseId.title}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="flex items-center gap-1"><Clock size={12} /> {new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right mr-4 hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reviewing Task</p>
                        <p className="text-sm font-bold text-slate-700">{submission.assignmentId.title}</p>
                    </div>
                    {submission.status === 'graded' ? (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-emerald-100 shadow-sm">
                            <CheckCircle2 size={14} /> Graded by {submission.gradedBy?.name || 'Instructor'}
                        </div>
                    ) : (
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-blue-100 shadow-sm">
                            <AlertCircle size={14} /> Pending Review
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content: Split View */}
            <div className="flex-grow flex overflow-hidden">
                
                {/* Left Pane: Document Viewer (65%) */}
                <div className="w-[65%] bg-slate-800 flex flex-col relative border-r border-slate-200">
                    <div className="flex-grow relative overflow-auto p-8 flex justify-center">
                        {isPDF ? (
                            <iframe 
                                src={`${submission.fileUrl}#toolbar=0`}
                                className="w-full h-full bg-white rounded-lg shadow-2xl"
                                title="Submission Viewer"
                            />
                        ) : isImage ? (
                            <img 
                                src={submission.fileUrl} 
                                alt="Student Submission" 
                                className="max-w-full h-auto object-contain rounded-lg shadow-2xl"
                            />
                        ) : (
                            <div className="w-full max-w-4xl bg-white p-12 rounded-2xl shadow-2xl min-h-[800px]">
                                <h3 className="text-2xl font-black text-slate-800 mb-8 border-b border-slate-100 pb-6 uppercase tracking-tight">Assignment Submission</h3>
                                <p className="text-slate-600 leading-relaxed font-serif text-lg whitespace-pre-wrap">
                                    {/* Fallback for text or unknown formats */}
                                    Format not supported for direct preview. 
                                    <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline ml-2 inline-flex items-center gap-1">
                                       Open in new tab <ExternalLink size={14} />
                                    </a>
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Viewer Controls */}
                    <div className="h-14 bg-slate-900 shrink-0 border-t border-slate-700/50 flex items-center justify-between px-6">
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                           <p>Submission ID: {submission._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <a 
                           href={submission.fileUrl} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="text-white hover:text-blue-400 text-xs font-bold transition-all flex items-center gap-2"
                        >
                           <ExternalLink size={14} /> Pop-out Preview
                        </a>
                    </div>
                </div>

                {/* Right Pane: Evaluation Sidebar (35%) */}
                <aside className="w-[35%] bg-white flex flex-col">
                    <form onSubmit={handleSubmitGrade} className="flex-grow flex flex-col p-8 overflow-y-auto">
                        
                        <div className="mb-10">
                            <h3 className="text-sm font-black text-slate-1000 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <GraduationCap className="text-blue-600" size={18} /> Evaluation Parameters
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Score Control Panel */}
                                <div className={`bg-white border rounded-3xl p-6 shadow-sm transition-all duration-300 ${Number(marks) > submission.assignmentId.totalMarks ? 'border-red-200' : 'border-slate-100'}`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Performance Score</h4>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            Number(marks) > submission.assignmentId.totalMarks ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {Number(marks) > submission.assignmentId.totalMarks ? 'Over Limit' : `Scale: 0 - ${submission.assignmentId.totalMarks}`}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="relative group">
                                            <input 
                                                type="number"
                                                required
                                                min="0"
                                                max={submission.assignmentId.totalMarks}
                                                value={marks}
                                                onChange={(e) => setMarks(e.target.value)}
                                                className={`w-24 px-4 py-3 bg-slate-50 border-2 rounded-2xl text-2xl font-black text-center focus:outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-200 ${
                                                    Number(marks) > submission.assignmentId.totalMarks 
                                                    ? 'border-red-500 text-red-600 focus:border-red-600' 
                                                    : 'border-slate-100 text-slate-800 focus:border-blue-600'
                                                }`}
                                                placeholder="--"
                                            />
                                        </div>
                                        
                                        <div className="flex-grow">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-bold text-slate-400">out of</span>
                                                <span className="text-2xl font-black text-slate-800">{submission.assignmentId.totalMarks}</span>
                                                <span className="text-xs font-bold text-slate-400 ml-1">Total Points</span>
                                            </div>
                                            {Number(marks) > submission.assignmentId.totalMarks ? (
                                                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tighter">⚠️ Marks exceed assignment maximum</p>
                                            ) : (
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Grade will be calculated as {(Number(marks) / submission.assignmentId.totalMarks * 100).toFixed(0)}%</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback Workspace */}
                                <div className="flex flex-col flex-grow">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-3">Professional Feedback</h4>
                                    <textarea 
                                        required
                                        rows="14"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Enter detailed feedback for the student..."
                                        className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all resize-none leading-relaxed shadow-inner font-sans scrollbar-hide min-h-[350px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-auto pt-6">
                            <button 
                                type="submit"
                                disabled={submitting || Number(marks) > submission.assignmentId.totalMarks}
                                className={`w-full py-5 rounded-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none ${
                                    Number(marks) > submission.assignmentId.totalMarks ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
                                }`}
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                                {submitting ? "Finalizing Review..." : "Confirm & Submit Grade"}
                            </button>
                            <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                                Student will be notified instantly
                            </p>
                        </div>
                    </form>

                    {/* Navigation Footer */}
                    <div className="h-24 bg-slate-50 border-t border-slate-100 px-8 flex items-center justify-between shrink-0">
                        <button 
                            onClick={() => handleNavigate('prev')}
                            disabled={currentIndex <= 0}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm transition-all text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed group border border-transparent hover:border-slate-100"
                        >
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Previous
                        </button>
                        
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Progress</p>
                            <div className="flex items-center gap-1.5 font-bold text-sm">
                                <span className="text-blue-600">{currentIndex + 1}</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-800">{queue.length}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleNavigate('next')}
                            disabled={currentIndex >= queue.length - 1}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm transition-all text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed group border border-transparent hover:border-slate-100"
                        >
                            Next <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const GraduationCap = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
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
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
);

export default AssignmentReview;
