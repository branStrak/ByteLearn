import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Rocket } from 'lucide-react';

const CtaSection = () => {
  return (
    <section className="py-24 relative overflow-hidden px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/30"
        >
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 border border-white/20 animate-bounce">
               <Rocket size={40} />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-8 italic">
              Ready to Accelerate Your Career?
            </h2>
            
            <p className="text-lg md:text-xl text-blue-100 font-medium leading-relaxed mb-12 opacity-90 max-w-2xl mx-auto">
              Join thousands of individuals and educators who are already building their future on ByteLearn.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link to="/register-student" className="group w-full sm:w-auto px-10 py-5 bg-white text-blue-600 font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                Start Learning Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link to="/apply-educator" className="w-full sm:w-auto px-10 py-5 bg-blue-900/30 text-white font-black text-sm uppercase tracking-widest rounded-2xl border-2 border-white/20 hover:bg-blue-900/50 transition-all active:scale-95 flex items-center justify-center gap-2">
                Join as Educator
              </Link>
            </div>

            <div className="mt-16 pt-10 border-t border-white/10 flex items-center justify-center gap-2">
               <GraduationCap size={24} className="text-white/40" />
               <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Verified by Global Educational Standards</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
