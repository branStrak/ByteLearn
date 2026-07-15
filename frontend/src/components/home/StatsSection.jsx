import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, Star } from 'lucide-react';

const stats = [
  { label: 'Active Students', value: '10K+', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Total Courses', value: '500+', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Expert Instructors', value: '200+', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Certificates Issued', value: '5K+', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`${stat.bg} flex flex-col items-center text-center p-8 rounded-[32px] border border-white/50 hover:shadow-xl hover:shadow-slate-200 transition-all group`}
            >
              <div className={`bg-white ${stat.color} p-4 rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={28} />
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">{stat.value}</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
