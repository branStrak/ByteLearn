import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
   IndianRupee,
   Clock,
   CheckCircle2,
   XCircle,
   Loader2,
   ArrowUpRight,
   User,
   Wallet,
   AlertCircle
} from 'lucide-react';
import AdminHeader from '../../components/layout/AdminHeader';

const PayoutRequests = () => {
   const [payouts, setPayouts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isProcessing, setIsProcessing] = useState(false);

   useEffect(() => {
      fetchPayoutRequests();
   }, []);

   const fetchPayoutRequests = async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('token');
         const config = { headers: { Authorization: `Bearer ${token}` } };
         const res = await axios.get('/api/admin/payouts', config);
         if (res.data.success) {
            setPayouts(res.data.payouts);
         }
      } catch (err) {
         console.error("Error fetching payout requests:", err);
      } finally {
         setLoading(false);
      }
   };

   const handleReviewPayout = async (transactionId, status) => {
      const action = status === 'completed' ? 'approve' : 'reject';
      if (!window.confirm(`Are you sure you want to ${action} this payout request?`)) return;

      try {
         setIsProcessing(true);
         const token = localStorage.getItem('token');
         const config = { headers: { Authorization: `Bearer ${token}` } };
         const res = await axios.put(`/api/admin/payouts/${transactionId}/review`, { status }, config);

         if (res.data.success) {
            alert(`Payout request ${status === 'completed' ? 'approved' : 'rejected'} successfully`);
            fetchPayoutRequests();
         }
      } catch (err) {
         console.error("Payout review error:", err);
         alert(err.response?.data?.message || "Failed to process payout request");
      } finally {
         setIsProcessing(false);
      }
   };

   return (
      <div className="min-h-screen bg-[#F8FAFC]">
         <AdminHeader />

         <main className="max-w-[1440px] mx-auto px-10 py-10 animate-in fade-in slide-in-from-bottom-5 duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
               <div>
                  <h1 className="text-[32px] font-black text-slate-800 tracking-tighter mb-1 uppercase">Payout Queue</h1>
                  <p className="text-slate-500 font-medium tracking-tight">Review and process educator withdrawal requests.</p>
               </div>
               <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                     <Wallet size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending Requests</p>
                     <p className="text-xl font-black text-slate-800 leading-none">{payouts.length}</p>
                  </div>
               </div>
            </div>

            {/* Payout List */}
            <div className="grid grid-cols-1 gap-4">
               {loading ? (
                  <div className="bg-white p-32 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                     <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Ledger...</p>
                  </div>
               ) : payouts.length === 0 ? (
                  <div className="bg-white p-32 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                     <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center border border-slate-100 mx-auto mb-6">
                        <CheckCircle2 size={36} className="text-slate-300" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Payout Queue Empty</h3>
                     <p className="text-sm font-medium text-slate-400">All educator withdrawals have been processed.</p>
                  </div>
               ) : (
                  payouts.map((payout) => (
                     <div key={payout._id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6 group">

                        {/* Identity & Protocol */}
                        <div className="flex items-center gap-4 sm:w-[250px] flex-shrink-0">
                           <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner flex-shrink-0">
                              <img
                                 src={payout.educatorId?.profilePicture || `https://ui-avatars.com/api/?name=${payout.educatorId?.name}&background=EFF6FF&color=2563EB`}
                                 className="w-full h-full object-cover"
                                 alt=""
                              />
                           </div>
                           <div className="flex flex-col">
                              <p className="text-sm font-black text-slate-800 tracking-tight mb-0.5">{payout.educatorId?.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium mb-2 truncate max-w-[150px]">{payout.educatorId?.email}</p>
                              <span className="self-start px-2 py-[2px] bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-slate-200">
                                 ID: #{payout._id.slice(-6)}
                              </span>
                           </div>
                        </div>

                        {/* Financial Metrics Grid */}
                        <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/50 p-5 rounded-[20px] border border-slate-50">

                           {/* Withdrawal Amount */}
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">Requested Out</p>
                              <div className="flex items-center gap-1.5 text-blue-600">
                                 <IndianRupee size={18} />
                                 <span className="text-2xl font-black tracking-tight leading-none">{payout.amount.toLocaleString()}</span>
                              </div>
                           </div>

                           {/* Wallet Balance */}
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">Wallet Balance</p>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                 <IndianRupee size={14} />
                                 <span className="text-lg font-bold tracking-tight leading-none">{payout.educatorId?.walletBalance?.toLocaleString() || 0}</span>
                              </div>
                           </div>

                           {/* Bank Route */}
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bank Route</p>
                              <div className="flex flex-col gap-0.5 text-slate-600">
                                 <span className="text-sm font-bold tracking-tight">{payout.educatorId?.bankDetails?.bankName || 'N/A Routing'}</span>
                                 <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                    A/C: ****{payout.educatorId?.bankDetails?.accountNumber?.slice(-4) || '****'}
                                 </span>
                              </div>
                           </div>

                           {/* Request Date */}
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Initiated</p>
                              <div className="flex items-center gap-2 text-slate-500">
                                 <Clock size={16} className="text-slate-300" />
                                 <span className="text-sm font-bold">{new Date(payout.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                           </div>

                        </div>

                        {/* Action Controls */}
                        <div className="flex items-center justify-end gap-3 sm:w-[180px] flex-shrink-0">
                           <button
                              onClick={() => handleReviewPayout(payout._id, 'failed')}
                              disabled={isProcessing}
                              className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95 disabled:opacity-50"
                              title="Reject Payout"
                           >
                              <XCircle size={22} className="stroke-[2.5px]" />
                           </button>
                           <button
                              onClick={() => handleReviewPayout(payout._id, 'completed')}
                              disabled={isProcessing}
                              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                           >
                              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} className="stroke-[2.5px]" />}
                              Approve
                           </button>
                        </div>

                     </div>
                  ))
               )}
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-6 bg-amber-50/80 rounded-[24px] flex items-center gap-4 border border-amber-200/50">
               <div className="p-3 bg-white text-amber-500 rounded-xl shadow-sm border border-amber-100">
                  <AlertCircle size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">System Notice</p>
                  <p className="text-sm font-medium text-slate-700 tracking-tight">
                     Approving a release will mark the bank transfer as "Completed". If rejected, funds will be instantly returned to the educator's wallet balance.
                  </p>
               </div>
            </div>

         </main>
      </div>
   );
};

export default PayoutRequests;
