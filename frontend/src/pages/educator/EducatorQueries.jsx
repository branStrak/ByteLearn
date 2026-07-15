import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  User, 
  BookOpen, 
  AlertCircle,
  TrendingUp,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import EducatorHeader from '../../components/layout/EducatorHeader';

const EducatorQueries = () => {
  const [queries, setQueries] = useState([]);
  const [activeQuery, setActiveQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);
  const [aiDrafts, setAiDrafts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [educatorName, setEducatorName] = useState('Educator');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/queries/educator?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(res.data.data);

      // Fetch Profile for name
      const profileRes = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEducatorName(profileRes.data.name);
    } catch (err) {
      console.error('Error fetching educator queries:', err);
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySelect = (query) => {
    setActiveQuery(query);
    setReplyText('');
    setAiDrafts([]);
  };

  const generateDrafts = async () => {
    if (!activeQuery) return;

    setIsGeneratingDrafts(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/queries/${activeQuery._id}/generate-drafts`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiDrafts(res.data.data);
      toast.success('AI Drafts generated!');
    } catch (err) {
      console.error('Error generating drafts:', err);
      toast.error('Failed to generate AI drafts. Please write a manual reply.');
    } finally {
      setIsGeneratingDrafts(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeQuery) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/queries/${activeQuery._id}/reply`, {
        answer: replyText.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Reply sent successfully!');
      
      // Remove from list and clear detail view
      setQueries(prev => prev.filter(q => q._id !== activeQuery._id));
      setActiveQuery(null);
      setReplyText('');
      setAiDrafts([]);
    } catch (err) {
      console.error('Error sending reply:', err);
      if (err.response?.status === 409) {
        toast.error('This query was already answered by another instructor.');
        fetchQueries(); // Refresh list
        setActiveQuery(null);
      } else {
        toast.error(err.response?.data?.message || 'Failed to send reply');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQueries = queries.filter(q => 
    q.studentId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.courseId?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <EducatorHeader educatorName={educatorName} activePage="/educator/queries" />
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between shadow-sm">
        <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <MessageSquare className="text-blue-600" />
             Instruction Support Inbox
           </h1>
           <p className="text-sm font-medium text-slate-500">Manage student doubts and provide high-quality feedback.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-blue-50 text-blue-700 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-blue-100 uppercase tracking-widest">
              <TrendingUp size={14} />
              {queries.length} Open Queries
           </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        
        {/* Left Pane: List View */}
        <div className="w-[380px] border-r border-slate-200 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-100">
             <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search student or question..." 
                  className="bg-transparent border-none outline-none px-3 py-1.5 text-sm w-full font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-grow overflow-y-auto hidden-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="animate-spin text-blue-600 mb-2" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Syncing Inbox...</p>
              </div>
            ) : filteredQueries.length > 0 ? (
              filteredQueries.map(q => (
                <button
                  key={q._id}
                  onClick={() => handleQuerySelect(q)}
                  className={`w-full text-left p-6 border-b border-slate-200 transition-all hover:bg-blue-50 relative group ${activeQuery?._id === q._id ? 'bg-blue-50/30' : ''}`}
                >
                  {activeQuery?._id === q._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                       {q.courseId?.title.substring(0, 15)}...
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-[15px] mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{q.studentId?.name}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed">
                    {q.question}
                  </p>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                 <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <CheckCircle2 size={32} className="text-slate-300" />
                 </div>
                 <h4 className="font-bold text-slate-400">In-box Zero!</h4>
                 <p className="text-xs text-slate-400 max-w-[200px] mt-1">No pending student questions at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Detail & Action View */}
        <div className="flex-grow bg-slate-50/50 flex flex-col relative">
          {activeQuery ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
               
               {/* Context Header */}
               <div className="p-10 border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <User size={24} />
                     </div>
                     <div>
                        <h2 className="text-[22px] font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{activeQuery.studentId?.name}</h2>
                        <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><BookOpen size={14} /> {activeQuery.courseId?.title}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span className="flex items-center gap-1.5"><Clock size={14} /> Asked {new Date(activeQuery.createdAt).toLocaleString()}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-[28px] p-8 border border-slate-200 relative">
                     <div className="absolute top-[-10px] left-6 text-[10px] font-black text-slate-400 bg-slate-50 px-3 uppercase tracking-[0.2em] border border-slate-200 rounded-full py-0.5">Original Question</div>
                     <p className="text-[17px] text-slate-800 font-bold leading-relaxed italic">
                        "{activeQuery.question}"
                     </p>
                  </div>
               </div>

               {/* Workspace */}
               <div className="flex-grow overflow-y-auto p-10">
                  
                  {/* AI Support Tools */}
                  <div className="mb-8">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
                          <Sparkles size={16} className="text-blue-500" /> AI Ghostwriter Assistants
                        </h3>
                        <button 
                          onClick={generateDrafts}
                          disabled={isGeneratingDrafts}
                          className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isGeneratingDrafts ? 'text-slate-400' : 'text-blue-600 hover:text-blue-800 active:scale-95'}`}
                        >
                          {isGeneratingDrafts ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                          {isGeneratingDrafts ? 'Thinking...' : 'Regenerate Drafts'}
                        </button>
                     </div>

                     {isGeneratingDrafts ? (
                        <div className="flex gap-4">
                           {[1,2,3].map(i => (
                             <div key={i} className="flex-1 h-32 bg-white rounded-2xl border border-slate-200 border-dashed animate-pulse flex items-center justify-center">
                                <Sparkles className="text-slate-100" size={24} />
                             </div>
                           ))}
                        </div>
                     ) : aiDrafts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
                           {aiDrafts.map((draft, idx) => {
                             const labels = ['Direct Answer', 'Metaphor/Analogy', 'Empowering/Encouraging'];
                             const colors = ['border-slate-400', 'border-blue-400', 'border-emerald-400'];
                             return (
                               <button 
                                 key={idx}
                                 onClick={() => setReplyText(draft)}
                                 className={`text-left p-6 bg-white border-2 border-transparent rounded-[24px] shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-[0.98] group`}
                               >
                                  <div className="mb-3">
                                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${colors[idx]} text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors`}>
                                       {labels[idx]}
                                     </span>
                                  </div>
                                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-4 italic">"{draft}"</p>
                               </button>
                             );
                           })}
                        </div>
                     ) : (
                       <button 
                        onClick={generateDrafts}
                        className="w-full py-8 bg-white border-2 border-dashed border-slate-200 rounded-[28px] flex flex-col items-center justify-center gap-2 group hover:border-blue-500 transition-all"
                       >
                          <Brain className="text-slate-300 group-hover:text-blue-500 transition-colors" size={32} />
                          <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600">Get AI Response Options</span>
                       </button>
                     )}
                  </div>

                  {/* Reply Area */}
                  <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                     <div className="mb-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 block mb-2 px-1">Compose Final Feedback</label>
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Your professional response..." 
                          className="w-full h-40 bg-slate-50/50 border border-slate-200 rounded-2xl p-6 text-[15px] font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300"
                        />
                     </div>
                     
                     <div className="flex items-center justify-between">
                        <p className="text-[11px] text-slate-400 font-bold italic">Character count: {replyText.length}</p>
                        <button 
                          onClick={handleSendReply}
                          disabled={isSubmitting || !replyText.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-600/30 uppercase tracking-widest text-sm"
                        >
                           {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                           Send Reply & Resolve
                        </button>
                     </div>
                  </div>
               </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-50">
               <div className="bg-slate-200/50 p-8 rounded-[40px] mb-6">
                  <MessageSquare size={64} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Select a question</h3>
               <p className="text-sm text-slate-400 font-bold max-w-xs mt-2 uppercase tracking-tight">Click on a student question from the left panel to begin drafting a response.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EducatorQueries;
