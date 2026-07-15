import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardCheck, Award, Zap, ShieldCheck, Globe } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Expert Curriculum',
    description: 'Master skills with modules designed by industry veterans and elite professors.',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    icon: ClipboardCheck,
    title: 'Adaptive Testing',
    description: 'Interactive quizzes that adapt to your level, providing instant feedback and clarity.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    icon: Award,
    title: 'Verified Success',
    description: 'Earn certificates that are recognized by global tech companies and employers.',
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    icon: Zap,
    title: 'Zero Latency',
    description: 'Enjoy a lightning-fast learning console that works smoothly even on slow net.',
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payouts',
    description: 'Educators receive earnings securely and instantly via our optimized wallet system.',
    color: 'text-rose-600',
    bg: 'bg-rose-50'
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Join a network of thousands of learners and mentors from across the globe.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50'
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-[40px] font-black text-slate-900 leading-tight mb-6 tracking-tight">
            Comprehensive Tools for <span className="text-blue-600">Total Mastery</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Everything you need to learn, teach, and succeed in the modern professional landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`${feature.bg} p-10 rounded-[32px] border border-white/50 hover:shadow-2xl hover:shadow-slate-200 transition-all group cursor-default`}
            >
              <div className={`bg-white ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight group-hover:translate-x-1 transition-transform">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed font-semibold text-[15px]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
