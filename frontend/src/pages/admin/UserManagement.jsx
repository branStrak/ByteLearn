import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldOff,
  Activity,
  Mail,
  Calendar,
  CheckCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminHeader from '../../components/layout/AdminHeader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/admin/users?role=${roleFilter}&search=${searchTerm}`, config);
      setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId, currentName) => {
    const confirmToggle = window.confirm(`Are you sure you want to change the account status for ${currentName}?`);
    if (!confirmToggle) return;

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`/api/admin/users/${userId}/toggle-status`, {}, config);
      toast.success("User access status updated successfully.");
      fetchUsers();
    } catch (err) {
      console.error("Status toggle error:", err);
      toast.error(err.response?.data?.message || "Failed to update user status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCount = users.filter(u => !u.isBlocked).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <AdminHeader />

      <main className="max-w-[1440px] mx-auto px-10 py-10">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[32px] font-bold text-slate-800 tracking-tight mb-1">User Management</h1>
            <p className="text-slate-500 font-medium tracking-tight">Manage and control all user accounts on ByteLearn.</p>
          </div>
          {/* Role Filter Tabs */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            {[
              { label: 'All Users', val: '' },
              { label: 'Students', val: 'student' },
              { label: 'Educators', val: 'educator' }
            ].map((filter) => (
              <button
                key={filter.val}
                onClick={() => setRoleFilter(filter.val)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  roleFilter === filter.val
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar + Active Count */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
          {/* Search */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 px-5 py-3 group">
            <Search size={18} className="text-slate-300 group-focus-within:text-blue-500 transition-colors shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="flex-1 bg-transparent focus:outline-none font-medium text-slate-700 placeholder:text-slate-300 text-sm"
            />
            <button
              onClick={fetchUsers}
              className="px-5 py-2 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              Search
            </button>
          </div>
          {/* Active Count Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Accounts</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{activeCount}</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px] max-h-[700px] overflow-y-auto custom-scrollbar relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading users...</p>
            </div>
          )}
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Joined</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                        <Users size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">No users found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="group hover:bg-blue-50 transition-colors">
                    {/* User Info */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                          <img
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=EFF6FF&color=2563EB`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                          {!user.isVerified && (
                            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black">!</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                            <Mail size={11} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        user.role === 'admin'    ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        user.role === 'educator' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <Calendar size={11} className="text-slate-300" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        {user.lastLogin && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium">
                            <Activity size={10} />
                            Last seen {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${user.isBlocked ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleStatus(user._id, user.name)}
                          disabled={isProcessing}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ml-auto ${
                            user.isBlocked
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                            : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                          } disabled:opacity-50`}
                        >
                          {user.isBlocked ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};

export default UserManagement;
