import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Download, 
  ExternalLink, 
  Search,
  Calendar,
  BadgeCheck,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';



const CertificatesPage = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentName, setStudentName] = useState('Student');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) return;

                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                // Fetch profile for name
                const profileRes = await axios.get('/api/auth/profile', config);
                if (profileRes.data && profileRes.data.data?.name) {
                    setStudentName(profileRes.data.data.name);
                } else if (profileRes.data && profileRes.data.name) {
                    setStudentName(profileRes.data.name);
                }

                const certRes = await axios.get('/api/certificates/me', config);
                setCertificates(certRes.data.data || []);
            } catch (error) {
                console.error("Error fetching certificates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            transition: { duration: 0.5, ease: "easeOut" } 
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
                <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-1/3 bg-slate-200 rounded-2xl"></div>
                        <div className="h-24 w-full bg-slate-200 rounded-3xl"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-slate-200 rounded-[40px]"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
            
            <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <section className="mb-12 relative">
                    <div className="absolute inset-0 bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                        {/* Decorative Background Effects */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
                        
                        {/* subtle grid pattern overlay */}
                        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    </div>
                    
                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-10 lg:p-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-[11px] bg-blue-50 w-fit px-3 py-1.5 rounded-full border border-blue-100">
                                <Award size={14} />
                                Official Credentials
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                                My Certificates
                            </h1>
                            <p className="text-slate-500 font-medium text-base max-w-xl leading-relaxed">
                                Your hard work translated into verified achievements. Download, share, and showcase your expertise to the world.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-5 bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] lg:min-w-[280px]"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-inner">
                                <BadgeCheck className="text-blue-600" size={32} />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                                <p className="text-3xl font-black text-slate-900 leading-none">
                                    {certificates.length} <span className="text-base font-semibold text-slate-400 ml-1">certs</span>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Grid Section */}
                <AnimatePresence mode="wait">
                    {certificates.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {certificates.map((cert) => (
                                <CertificateCard key={cert._id} cert={cert} variants={itemVariants} />
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

const CertificateCard = ({ cert, variants }) => {
    const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <motion.div
            variants={variants}
            className="group flex flex-col bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
        >
            {/* Visual Preview Area */}
            <div className="relative h-48 w-full bg-blue-50 overflow-hidden p-6 flex flex-col justify-between border-b border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent"></div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div className="bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white shadow-sm flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Verified</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 p-0.5 shadow-lg shadow-amber-500/10">
                        <div className="h-full w-full bg-white rounded-full flex items-center justify-center border border-amber-100">
                            <Award size={18} className="text-amber-500" />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Award size={12} className="text-blue-500" /> Certificate of Completion
                    </p>
                    <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-2">
                        {cert.courseId?.title}
                    </h3>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold border border-slate-200">
                        {cert.educatorId?.name?.charAt(0) || 'B'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Instructor</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{cert.educatorId?.name || "ByteLearn Academy"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grade</p>
                        <p className="text-sm font-bold text-slate-900 flex items-baseline gap-1.5">
                            {cert.gradeLabel} <span className="text-xs font-semibold text-blue-600">({cert.finalPercentage}%)</span>
                        </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issued On</p>
                        <p className="text-sm font-bold text-slate-900">
                            {formatDate(cert.issuedAt)}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center py-2.5 px-4 bg-slate-50 rounded-xl mb-6 border border-dashed border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credential ID</span>
                    <span className="text-[10px] font-mono font-bold text-slate-600 uppercase truncate ml-4">{cert.certificateId}</span>
                </div>

                <div className="flex gap-3 mt-auto">
                    <a 
                        href={cert.pdfUrl} 
                        download={`Certificate-${cert.certificateId}.pdf`}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 text-center flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                    >
                        <Download size={16} /> Download
                    </a>
                    <a 
                        href={cert.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-[52px] flex-shrink-0 border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-center transition-all active:scale-95"
                        title="View Full Certificate"
                    >
                        <ExternalLink size={18} />
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

const EmptyState = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[60px] border-2 border-dashed border-slate-200 text-center px-10"
        >
            <div className="w-32 h-32 bg-blue-50 rounded-[40px] flex items-center justify-center mb-8 rotate-3">
                <Award size={64} className="text-blue-300 -rotate-3" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">Your wall of fame is waiting</h3>
            <p className="text-slate-500 max-w-lg mb-10 text-lg font-medium leading-relaxed">
                Complete your remaining assignments and quizzes with a passing grade to earn your official course certifications.
            </p>
            <a 
                href="/my-courses"
                className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
            >
                Continue Learning <ChevronRight size={20} />
            </a>
        </motion.div>
    );
};

export default CertificatesPage;
