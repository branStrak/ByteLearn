import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { IndianRupee, Wallet, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';
import Footer from '../../components/layout/Footer';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const EducatorEarnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [educatorName, setEducatorName] = useState('Educator');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/educator/earnings', config);
        setData(res.data);

        // Fetch user profile for name
        const profileRes = await axios.get('/api/auth/profile', config);
        setEducatorName(profileRes.data.name);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [navigate]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount to withdraw.');
      return;
    }
    
    if (amount > (data?.stats?.walletBalance || 0)) {
      toast.error('Insufficient wallet balance.');
      return;
    }
    
    try {
      setIsWithdrawing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.post('/api/educator/earnings/withdraw', { amount }, config);
      
      if (res.data.success) {
        toast.success(res.data.message || 'Payout requested successfully');
        setWithdrawAmount('');
        // Refresh earnings data to show the new pending transaction and updated balance
        const updatedRes = await axios.get('/api/educator/earnings', config);
        setData(updatedRes.data);
      }
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
      toast.error(error.response?.data?.message || 'Failed to request payout. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-16 px-6 py-10 w-full max-w-[1400px] mx-auto">
        <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-xl mb-4"></div>
        <div className="h-5 w-96 bg-slate-200 animate-pulse rounded-lg mb-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>)}
        </div>
        
        <div className="h-[400px] bg-slate-200 animate-pulse rounded-[24px] mb-12"></div>
        
        <div className="h-[400px] bg-slate-200 animate-pulse rounded-[24px]"></div>
      </div>
    );
  }

  const { stats, transactions, chartData } = data || {
    stats: { walletBalance: 0, totalEarnings: 0, totalSales: 0 },
    transactions: [],
    chartData: []
  };

  const colorMap = {
    blue: { bg: 'bg-blue-50/50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50/50', text: 'text-emerald-600' },
    indigo: { bg: 'bg-indigo-50/50', text: 'text-indigo-600' }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans mb-16">
      <EducatorHeader educatorName={educatorName} activePage="/educator/earnings" />
      <motion.main 
        className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10">
          <h1 className="text-[36px] font-bold text-slate-900 mb-2 tracking-tight">
            Earnings Dashboard
          </h1>
          <p className="text-[16px] text-slate-500 font-medium">
            Track your revenue, sales history, and account balance.
          </p>
        </div>

        {/* KPI Cards - Redesigned with Median Blue UI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Available Balance */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#EFF6FF] rounded-[32px] border border-[#DBEAFE] shadow-sm p-8 flex flex-col transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 text-slate-900">
               <Wallet size={140} />
            </div>
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorMap.blue.bg} ${colorMap.blue.text} shadow-inner`}>
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Available Balance</p>
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline relative z-10">
              <span className="text-2xl font-bold text-slate-400 mr-1.5">₹</span>
              {stats.walletBalance.toLocaleString('en-IN')}
            </h3>
          </motion.div>

          {/* Card 2: Total Earned */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#EFF6FF] rounded-[32px] border border-[#DBEAFE] shadow-sm p-8 flex flex-col transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 text-slate-900">
               <TrendingUp size={140} />
            </div>
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorMap.emerald.bg} ${colorMap.emerald.text} shadow-inner`}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Total Earned</p>
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline relative z-10">
              <span className="text-2xl font-bold text-slate-400 mr-1.5">₹</span>
              {stats.totalEarnings.toLocaleString('en-IN')}
            </h3>
          </motion.div>

          {/* Card 3: Total Sales */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#EFF6FF] rounded-[32px] border border-[#DBEAFE] shadow-sm p-8 flex flex-col transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 text-slate-900">
               <Calendar size={140} />
            </div>
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorMap.indigo.bg} ${colorMap.indigo.text} shadow-inner`}>
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Total Sales</p>
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline relative z-10">
              {stats.totalSales}
              <span className="text-sm font-bold text-slate-400 ml-2 uppercase tracking-widest">Units</span>
            </h3>
          </motion.div>
        </div>

        {/* Payout Request Section */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
            <svg width="100%" height="100%"><pattern id="pattern-payout" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor"/></pattern><rect width="100%" height="100%" fill="url(#pattern-payout)"/></svg>
          </div>
          <div className="relative z-10 flex-1">
            <h2 className="text-[19px] font-bold text-slate-900 mb-1 flex items-center">
              Request a Payout <ArrowUpRight size={20} className="ml-1 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </h2>
            <p className="text-[14px] text-slate-500 font-medium">Withdraw funds directly to your linked bank account.</p>
          </div>
          <form onSubmit={handleWithdraw} className="relative z-10 flex w-full md:w-auto gap-3 items-center">
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee size={16} className="text-slate-400" />
              </div>
              <input 
                type="number" 
                min="1"
                step="1"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-medium"
                disabled={isWithdrawing}
              />
            </div>
            <button 
              type="submit" 
              disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md hover:shadow-lg active:scale-95"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
            </button>
          </form>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[19px] font-bold text-slate-900">Earnings Overview</h2>
          </div>
          <div className="h-[350px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `₹${value}`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#ffffff',
                      padding: '12px 16px',
                    }}
                    itemStyle={{ color: '#0f172a', fontWeight: 800, fontSize: '16px' }}
                    labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#2563eb" 
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 8, strokeWidth: 3, fill: '#ffffff', stroke: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No earnings data for the selected period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[19px] font-bold text-slate-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-8 py-4">Date</th>
                  <th scope="col" className="px-8 py-4">Transaction / Course</th>
                  <th scope="col" className="px-8 py-4">Type</th>
                  <th scope="col" className="px-8 py-4">Status</th>
                  <th scope="col" className="px-8 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-blue-50 transition-colors cursor-default">
                      <td className="px-8 py-5 whitespace-nowrap text-slate-600 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-8 py-5 text-slate-800 font-medium">
                        {tx.description || 'Earnings'}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          tx.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                          tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-slate-900 whitespace-nowrap">
                        <span className={tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}>
                          {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center">
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </motion.main>
      <Footer />
    </div>
  );
};

export default EducatorEarnings;
