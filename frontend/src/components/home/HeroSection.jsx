import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-blue-100">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Next-Gen Learning Platform
              </span>
              
              <h1 className="text-[48px] sm:text-[64px] lg:text-[76px] font-black text-slate-900 leading-[1.05] tracking-tighter mb-8">
                Master New <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] animate-gradient-x">Future Skills</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                Join a world-class community of 10,000+ learners learning from elite industry experts. Get certified and accelerate your journey in any field.
              </p>

              <div className="space-y-3 mb-10">
                {['24/7 Expert Support', 'Access to Global Knowledge Community', 'Curated Professional Roadmap'].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-center lg:justify-start gap-3 text-slate-700 font-bold text-sm">
                    <CheckCircle2 className="text-blue-600" size={18} /> {item}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-6">
                <Link to="/register-student" className="group w-full sm:w-auto px-10 py-5 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                  Get Started Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link to="/browse" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-800 font-black text-sm uppercase tracking-widest rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3">
                  <PlayCircle size={20} className="text-blue-600" /> Browse Catalog
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Media Case / Image Area */}
          <div className="lg:w-1/2 relative">
             <motion.div
               initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
               animate={{ opacity: 1, scale: 1, rotate: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative z-10"
             >
                <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-[40px] shadow-2xl border border-slate-100 active:rotate-1 transition-transform">
                   <img 
                    src="/learning_platform_hero.png" 
                    alt="Platform Preview" 
                    className="w-full h-auto rounded-[32px] shadow-sm"
                   />
                </div>

                {/* Floating Cards */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 hidden sm:block"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                         <Users size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">New Enrollments</p>
                        <p className="text-xl font-black text-slate-800 leading-none">+2,480</p>
                      </div>
                   </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 hidden sm:block"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                         <PlayCircle size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Classes</p>
                        <p className="text-xl font-black text-slate-800 leading-none">12 Now</p>
                      </div>
                   </div>
                </motion.div>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
