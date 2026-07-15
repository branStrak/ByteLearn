import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Check, X, User as UserIcon, BookOpen, AlertCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const InviteAcceptPage = () => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchInviteDetails();
    }, [token]);

    const fetchInviteDetails = async () => {
        try {
            const res = await axios.get(`/api/invites/${token}`);
            const inviteData = res.data.data;
            setInvite(inviteData);
            
            // Auto-trigger action if present in URL (from email buttons)
            const action = searchParams.get('action');
            if (action && inviteData.status === 'pending') {
                const tokenVal = localStorage.getItem('token');
                if (tokenVal) {
                    handleAction(action, inviteData);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load invite details');
        } finally {
            setLoading(false);
        }

        // Also fetch current profile for checking
        const tokenVal = localStorage.getItem('token');
        if (tokenVal) {
            try {
                const res = await axios.get('/api/auth/profile', {
                    headers: { Authorization: `Bearer ${tokenVal}` }
                });
                setCurrentUser(res.data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        }
    };

    const handleAction = async (action, currentInvite) => {
        const tokenVal = localStorage.getItem('token');
        const activeInvite = currentInvite || invite;
        if (!tokenVal) {
            toast.error('Please login to accept the invitation');
            navigate(`/login?redirect=/invite/${token}?action=${action}`);
            return;
        }

        setProcessing(true);
        try {
            const res = await axios.patch(`/api/invites/${token}/${action}`, {}, {
                headers: { Authorization: `Bearer ${tokenVal}` }
            });
            toast.success(res.data.message);
            if (action === 'accept') {
                navigate(`/course/${activeInvite.courseId._id}/curriculum`);
            } else {
                navigate('/educator/courses');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} invite`);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Validating invitation...</p>
                </div>
            </div>
        );
    }

    if (error || !invite) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Invitation</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {error || 'The invitation link you followed is invalid or has expired.'}
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-20">
            <div className="max-w-xl w-full">
                {/* Brand Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">ByteLearn</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                    {/* Course Header */}
                    <div className="relative h-48 bg-slate-900">
                        {invite.courseId.thumbnail ? (
                            <img 
                                src={invite.courseId.thumbnail} 
                                alt={invite.courseId.title}
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-16 h-16 text-slate-700" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        <div className="absolute bottom-6 left-8 right-8">
                            <span className="inline-block px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg mb-2">
                                New Collaboration
                            </span>
                            <h2 className="text-2xl font-extrabold text-white leading-tight">
                                {invite.courseId.title}
                            </h2>
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        {/* Invitation Context */}
                        <div className="flex items-start gap-4 mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="shrink-0">
                                {invite.invitedBy.profilePicture ? (
                                    <img 
                                        src={invite.invitedBy.profilePicture} 
                                        alt={invite.invitedBy.name}
                                        className="w-14 h-14 rounded-xl object-cover ring-4 ring-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl ring-4 ring-white shadow-sm">
                                        {invite.invitedBy.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm mb-1 uppercase tracking-wide font-semibold">Invitation from</p>
                                <h3 className="text-lg font-bold text-slate-900">{invite.invitedBy.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mt-2 italic">
                                    "I'd like to invite you as a co-instructor for this course. Let's build something great together!"
                                </p>
                            </div>
                        </div>

                        {/* Recipient Marker */}
                        <div className="mb-10 text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-black mb-3">Sent to recipient</p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">{invite.invitedEmail}</span>
                            </div>
                            
                            {currentUser && currentUser._id !== invite.invitedUserId._id && (
                                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in zoom-in-95 duration-300">
                                    <div className="flex items-start gap-3 text-left">
                                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-rose-800">Wrong Account Detected</p>
                                            <p className="text-xs text-rose-600 leading-relaxed mt-1">
                                                You are currently logged in as <strong>{currentUser.name}</strong> ({currentUser.email}). 
                                                Please <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="underline font-black">logout</button> and log in with <strong>{invite.invitedEmail}</strong> to accept this invite.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Check */}
                        {invite.status !== 'pending' ? (
                            <div className="text-center py-6">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-6 ${
                                    invite.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {invite.status === 'accepted' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    Invitation Already {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                                </div>
                                <button 
                                    onClick={() => navigate('/educator/courses')}
                                    className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    Go to My Courses <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-600 text-center mb-8 leading-relaxed">
                                    By accepting, you will gain full access to the curriculum builder and shared revenue from enrollments.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction('accept')}
                                        disabled={processing}
                                        className="h-16 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                        Accept Invite
                                    </button>
                                    <button
                                        onClick={() => handleAction('decline')}
                                        disabled={processing}
                                        className="h-16 bg-white text-slate-600 border-2 border-slate-100 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        <X className="w-5 h-5" />
                                        Decline
                                    </button>
                                </div>
                                
                                <p className="text-[11px] text-slate-400 text-center mt-6 uppercase tracking-widest font-bold">
                                    Expires {new Date(invite.expiresAt).toLocaleDateString()} at {new Date(invite.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteAcceptPage;
