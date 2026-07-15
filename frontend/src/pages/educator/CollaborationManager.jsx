import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    UserPlus, Mail, Trash2, Clock, CheckCircle2, XCircle, 
    Loader2, AlertCircle, Shield, User, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const CollaborationManager = ({ courseId, isOwner }) => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchInvites();
    }, [courseId]);

    const fetchInvites = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/invites/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvites(res.data.data);
        } catch (err) {
            console.error('Error fetching invites:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/api/invites/send`, 
                { courseId, email: email.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Invitation sent successfully');
            setEmail('');
            fetchInvites();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setSending(false);
        }
    };

    const handleRevoke = async (inviteId) => {
        if (!window.confirm('Are you sure you want to revoke this invitation?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/invites/${inviteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Invitation revoked');
            fetchInvites();
        } catch (err) {
            toast.error('Failed to revoke invitation');
        }
    };

    const handleRemoveCoInstructor = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this co-instructor? They will lose all access to this course.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/invites/course/${courseId}/co-instructor/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Co-instructor removed');
            fetchInvites();
        } catch (err) {
            toast.error('Failed to remove co-instructor');
        }
    };

    const copyInviteLink = (inviteToken) => {
        const link = `${window.location.origin}/invite/${inviteToken}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Invite link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-slate-500 font-medium">Loading collaborators...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Invite Section */}
            {isOwner && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Invite Collaborator</h3>
                            <p className="text-sm text-slate-500 font-medium">Collaborate with other approved educators on this course</p>
                        </div>
                    </div>

                    <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="email"
                                required
                                placeholder="Educator's email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={sending || !email.trim()}
                            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                            Send Invite
                        </button>
                    </form>
                    
                    <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            <strong>Note:</strong> You can only invite users who are registered as <strong>Approved Educators</strong> on ByteLearn. Collaborators will share the course revenue equally (50/50 split) and have full editing access.
                        </p>
                    </div>
                </div>
            )}

            {/* List Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="text-indigo-500" size={18} />
                        Active Collaborators & Invites
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                        {invites.length} Total
                    </span>
                </div>

                <div className="divide-y divide-slate-100">
                    {invites.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <User className="text-slate-300" size={32} />
                            </div>
                            <h4 className="text-slate-900 font-bold mb-1">No collaborators yet</h4>
                            <p className="text-slate-500 text-sm">Start inviting educators to build this course together.</p>
                        </div>
                    ) : (
                        invites.map((invite) => (
                            <div key={invite._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {invite.invitedUser?.profilePicture ? (
                                            <img 
                                                src={invite.invitedUser.profilePicture} 
                                                alt={invite.invitedUser.name} 
                                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
                                            />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ring-2 ring-white shadow-sm ${
                                                invite.status === 'accepted' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {invite.invitedUser?.name?.charAt(0) || <Mail size={20} />}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                                            invite.status === 'accepted' ? 'bg-emerald-500 text-white' :
                                            invite.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                        }`}>
                                            {invite.status === 'accepted' ? <CheckCircle2 size={10} strokeWidth={3} /> :
                                             invite.status === 'pending' ? <Clock size={10} strokeWidth={3} /> : <XCircle size={10} strokeWidth={3} />}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800">
                                                {invite.invitedUserId?.name || invite.invitedEmail}
                                            </h4>
                                            {invite.status === 'accepted' && (
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded">Collaborator</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500">{invite.invitedEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {invite.status === 'pending' && isOwner && (
                                        <button 
                                            onClick={() => copyInviteLink(invite.token)}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-white transition-all shadow-sm active:scale-95"
                                        >
                                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                            {copied ? 'Copied' : 'Copy Link'}
                                        </button>
                                    )}
                                    
                                    {isOwner && (
                                        <button 
                                            onClick={() => invite.status === 'accepted' ? handleRemoveCoInstructor(invite.invitedUserId._id) : handleRevoke(invite._id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                                            title={invite.status === 'accepted' ? "Remove Co-Instructor" : "Revoke Invitation"}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollaborationManager;
