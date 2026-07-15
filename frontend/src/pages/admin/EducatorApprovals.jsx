import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  X, 
  Check,
  Clock,
  Download,
  AlertCircle,
  FileText,
  Briefcase,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import AdminHeader from '../../components/layout/AdminHeader';

const EducatorApprovals = () => {
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEducator, setSelectedEducator] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchEducators();
  }, [statusFilter]);

  const fetchEducators = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/admin/educators?status=${statusFilter}`, config);
      setEducators(res.data.educators);
    } catch (err) {
      console.error("Error fetching educators:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/educators/${id}/review`, { status }, config);
      alert(`Educator ${status === 'approved' ? 'Approved' : 'Rejected'} Successfully!`);
      setSelectedEducator(null);
      fetchEducators();
    } catch (err) {
      console.error("Review error:", err);
      alert("Failed to review educator. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <AdminHeader />
      
      <main className="max-w-[1440px] mx-auto px-10 py-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[32px] font-bold text-slate-800 tracking-tight mb-1">Educator Approvals</h1>
            <p className="text-slate-500 font-medium tracking-tight">Review credentials and verify educators for the platform.</p>
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             {['pending', 'approved', 'rejected'].map((s) => (
               <button
                 key={s}
                 onClick={() => setStatusFilter(s)}
                 className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                   statusFilter === s 
                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                   : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {s}
               </button>
             ))}
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px] max-h-[700px] overflow-y-auto custom-scrollbar relative">
           <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-100 font-bold text-[10px] text-slate-400 uppercase tracking-[0.2em] uppercase">
                 <tr>
                    <th className="px-8 py-5">Applicant</th>
                    <th className="px-8 py-5">Email Address</th>
                    <th className="px-8 py-5">Date Applied</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {loading ? (
                    <tr><td colSpan="5" className="p-20 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                 ) : educators.length === 0 ? (
                    <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No applicants found in this category.</td></tr>
                 ) : (
                    educators.map((edu) => (
                       <tr key={edu._id} className="group hover:bg-blue-50 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                 <img src={edu.profilePicture || `https://ui-avatars.com/api/?name=${edu.name}&background=EFF6FF&color=2563EB`} alt={edu.name} className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-100" />
                                <span className="text-sm font-bold text-slate-800 tracking-tight whitespace-nowrap">{edu.name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-medium text-slate-500 whitespace-nowrap">{edu.email}</td>
                          <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(edu.educatorApplication?.appliedAt || edu.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                edu.educatorApplication?.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                edu.educatorApplication?.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'
                             }`}>
                                {edu.educatorApplication?.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button 
                               onClick={() => setSelectedEducator(edu)}
                               className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-95"
                             >
                                Review
                             </button>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>

        {/* Modal/Drawer Overlay */}
        {selectedEducator && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
                
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                   <div className="flex items-center gap-4">
                       <img src={selectedEducator.profilePicture || `https://ui-avatars.com/api/?name=${selectedEducator.name}&background=EFF6FF&color=2563EB`} alt={selectedEducator.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50" />
                      <div>
                         <h2 className="text-xl font-bold text-slate-800 tracking-tight">{selectedEducator.name}</h2>
                         <p className="text-sm font-medium text-slate-400 capitalize">{selectedEducator.email}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedEducator(null)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 hover:rotate-90 transition-all">
                      <X size={24} className="text-slate-500" />
                   </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-grow overflow-y-auto p-10 space-y-10 bg-white custom-scrollbar">
                   
                   {/* Applicant Profiles Section */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="h-px flex-grow bg-slate-100" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 whitespace-nowrap">Professional Profile</span>
                        <div className="h-px flex-grow bg-slate-100" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <FileText size={14} className="text-blue-500" /> Qualifications
                            </label>
                            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 text-sm text-slate-700 font-medium leading-relaxed">
                               {selectedEducator.educatorApplication?.qualifications || <span className="text-slate-300 italic">No academic history provided.</span>}
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={14} className="text-blue-500" /> Industry Experience
                            </label>
                             <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 text-sm text-slate-700 font-medium leading-relaxed">
                                {selectedEducator.educatorApplication?.experience || <span className="text-slate-300 italic">No professional background provided.</span>}
                             </div>
                         </div>
                      </div>
                   </div>

                   {/* Verification Documents */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 text-slate-400">
                         <div className="h-px flex-grow bg-slate-100" />
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 whitespace-nowrap">Verification Documents</span>
                         <div className="h-px flex-grow bg-slate-100" />
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                         {selectedEducator.educatorApplication?.supportingCredentials?.map((cred, i) => (
                            <a 
                              key={i} 
                              href={cred} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group p-5 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-blue-600 hover:border-blue-600 transition-all shadow-sm"
                            >
                               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                  <Download size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest text-center">Credential {i+1}</span>
                            </a>
                         ))}
                         {(!selectedEducator.educatorApplication?.supportingCredentials || selectedEducator.educatorApplication?.supportingCredentials.length === 0) && (
                            <div className="col-span-full py-12 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-3">
                               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100">
                                  <AlertCircle size={24} />
                               </div>
                               <p className="text-[11px] font-bold uppercase tracking-widest">No documentation attached</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Modal Actions */}
                {selectedEducator.educatorApplication?.status === 'pending' && (
                  <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-2 gap-6 sticky bottom-0 z-10">
                     <button 
                        onClick={() => handleReview(selectedEducator._id, 'rejected')}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 disabled:opacity-50"
                     >
                        <XCircle size={18} /> Reject Applicant
                     </button>
                     <button 
                        onClick={() => handleReview(selectedEducator._id, 'approved')}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50"
                     >
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        Approve Access
                     </button>
                  </div>
                )}

             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default EducatorApprovals;
