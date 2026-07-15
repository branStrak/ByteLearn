import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Zap, Globe } from 'lucide-react';

const reasons = [
  {
    title: 'Industry-Leading Curriculum',
    desc: 'Courses developed in collaboration with top tech giants to ensure you learn exactly what the market demands.',
    icon: ShieldCheck,
    color: 'bg-blue-600'
  },
  {
    title: 'Interactive Learning Console',
    desc: 'Write code, run quizzes, and submit assignments directly within our advanced browser-based platform.',
    icon: Zap,
    color: 'bg-amber-500'
  },
  {
    title: 'Verified Global Certificates',
    desc: 'Your success is recognized worldwide. Gain certificates that add real weight to your resume and LinkedIn.',
    icon: CheckCircle2,
    color: 'bg-emerald-500'
  },
  {
    title: 'Learn Anytime, Anywhere',
    desc: 'Fully responsive platform that lets you switch between devices seamlessly without losing progress.',
    icon: Globe,
    color: 'bg-purple-600'
  }
];

const WhyChooseUs = () => {
  return (
    <section id="why-choose-us" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2">
            <h2 className="text-[42px] font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Why ByteLearn is the <span className="text-blue-600">Smartest Choice</span> for Your Career
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
              We don't just provide content; we provide a transformative learning ecosystem designed to bridge the gap between education and employment.
            </p>
            
            <div className="space-y-4">
              {['24/7 Expert Support', 'Access to Elite Developer Community', 'Curated Professional Roadmap'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-slate-800 font-bold text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.map((reason, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-12 h-12 ${reason.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/10`}>
                   <reason.icon size={24} />
                </div>
                <h3 className="text-[17px] font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{reason.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{reason.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
