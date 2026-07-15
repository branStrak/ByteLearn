import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import { MessageSquare, Clock, CheckCircle2, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';

const StudentQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQueryId, setActiveQueryId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/queries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.data || [];
        setQueries(data);
        if (data.length > 0) {
          setActiveQueryId(data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch queries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  useEffect(() => {
    // Mark as read when active query changes and is unread
    const markAsRead = async () => {
      const activeQuery = queries.find(q => q._id === activeQueryId);
      if (activeQuery && activeQuery.status === 'resolved' && !activeQuery.studentRead) {
        try {
          const token = localStorage.getItem('token');
          await axios.patch(`/api/queries/${activeQueryId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setQueries(prev => prev.map(q => q._id === activeQueryId ? { ...q, studentRead: true } : q));
        } catch (err) {
          console.error("Failed to mark as read", err);
        }
      }
    };
    if (activeQueryId) {
      markAsRead();
    }
  }, [activeQueryId, queries]);

  const activeQuery = queries.find(q => q._id === activeQueryId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <main className="flex-grow max-w-[1400px] w-full mx-auto px-6 py-8 flex flex-col h-[85vh]">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-[28px] font-bold text-slate-800 tracking-tight">My Queries</h1>
          <p className="text-slate-500">View and manage your private 1-on-1 discussions with educators.</p>
        </div>

        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-grow min-h-[500px]">
          
          {/* Left Sidebar List */}
          <div className="w-[380px] border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0">
            <div className="p-4 border-b border-slate-200 bg-white">
               <h2 className="font-bold text-slate-800 text-[15px]">All Questions ({queries.length})</h2>
            </div>
            
            <div className="overflow-y-auto flex-grow p-3 space-y-2">
              {loading ? (
                <div className="flex justify-center p-8"><span className="text-slate-400">Loading...</span></div>
              ) : queries.length === 0 ? (
                <div className="text-center p-8 text-slate-400">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No queries yet</p>
                </div>
              ) : (
                queries.map(q => (
                  <button
                    key={q._id}
                    onClick={() => setActiveQueryId(q._id)}
                    className={`w-full text-left p-4 rounded-xl transition-all relative border block ${
                      activeQueryId === q._id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    {!q.studentRead && q.status === 'resolved' && (
                       <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" />
                    )}
                    <div className="flex gap-2 items-center mb-2 pr-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        q.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {q.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className={`font-bold text-[14px] line-clamp-2 leading-snug ${activeQueryId === q._id ? 'text-blue-900' : 'text-slate-800'}`}>
                      {q.question}
                    </h3>
                    
                    {q.courseId && (
                      <p className="text-[12px] text-slate-500 mt-2 truncate font-medium flex items-center gap-1.5">
                        <BookOpen size={13} className="text-slate-400" /> {q.courseId.title}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Side Chat History */}
          <div className="flex-grow flex flex-col bg-white overflow-hidden relative min-h-0">
            {activeQuery ? (
              <>
                 <div className="p-6 border-b border-slate-100 bg-white shadow-sm z-10 flex justify-between items-start flex-shrink-0">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{activeQuery.question}</h2>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium"><Clock size={15}/> Asked on {new Date(activeQuery.createdAt).toLocaleDateString()}</span>
                        {activeQuery.status === 'resolved' && (
                           <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded"><CheckCircle2 size={15}/> Resolved</span>
                        )}
                      </div>
                    </div>
                 </div>

                 <div className="flex-grow overflow-y-auto p-8 bg-slate-50/50 flex flex-col gap-6">
                    
                    {/* Student Question Bubble */}
                    <div className="max-w-[85%] self-end flex gap-4 flex-row-reverse">
                       <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold flex-shrink-0 border border-slate-300">
                         You
                       </div>
                       <div className="flex flex-col items-end">
                         <p className="text-xs font-bold text-slate-500 mb-1 mr-1"><span className="font-normal mr-2">{new Date(activeQuery.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span> You</p>
                         <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tr-sm shadow-sm text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                           {activeQuery.question}
                         </div>
                       </div>
                    </div>

                    {/* Context Link */}
                    {activeQuery.lessonId && activeQuery.courseId && (
                       <div className="self-center my-4 group">
                          <button 
                            onClick={() => navigate(`/learn/${activeQuery.courseId._id}`)}
                            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-5 py-2.5 text-blue-700 text-[13px] font-semibold flex items-center gap-2.5 transition-all shadow-sm"
                          >
                             <PlayCircle size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                             Asked in Lesson: {activeQuery.lessonId.title || 'Course Material'}
                             <ChevronRight size={16} className="opacity-60 ml-1" />
                          </button>
                       </div>
                    )}

                    {/* Educator Answer Bubble */}
                    {activeQuery.answer && (
                      <div className="max-w-[85%] self-start flex gap-4 mb-6">
                         <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                           In
                         </div>
                         <div className="flex flex-col items-start">
                           <p className="text-xs font-bold text-slate-500 mb-1 ml-1">Instructor <span className="font-normal ml-2">{new Date(activeQuery.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                           <div className="bg-[#2563EB] p-5 rounded-2xl rounded-tl-sm shadow-md text-white text-[15px] leading-relaxed whitespace-pre-wrap border border-blue-700">
                             {activeQuery.answer}
                           </div>
                         </div>
                      </div>
                    )}

                 </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-8">
                 <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
                 <p className="text-lg font-medium text-slate-500">Select a query to view history</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentQueries;
