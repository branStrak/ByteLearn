import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Briefcase, MessageCircle, GraduationCap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const role = user.role;

  const getPlatformLinks = () => {
    if (!token) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Why Choose Us', path: '/#why-choose-us' },
        { name: 'Browse Courses', path: '/browse' },
      ];
    }
    
    if (role === 'student') {
      return [
        { name: 'Dashboard', path: '/student-dashboard' },
        { name: 'Browse Courses', path: '/browse' },
        { name: 'My Courses', path: '/my-courses' },
      ];
    }

    if (role === 'educator') {
      return [
        { name: 'Dashboard', path: '/educator-dashboard' },
        { name: 'My Courses', path: '/educator/courses' },
        { name: 'Earnings', path: '/educator/earnings' },
      ];
    }

    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin-dashboard' },
        { name: 'Course Approvals', path: '/admin/courses' },
        { name: 'Users', path: '/admin/users' },
      ];
    }

    return [
      { name: 'Home', path: '/' },
      { name: 'Browse Courses', path: '/browse' },
    ];
  };

  const platformLinks = getPlatformLinks();

  return (
    <footer className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <GraduationCap size={24} className="text-white" />
              </div>
              <span className="tracking-tight">ByteLearn</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Empowering learners with interactive, high-quality education in any field.
            </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              <Code size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              <Briefcase size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        {/* Column 2: Dynamic Platform Links */}
        <div>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-widest">Platform</h3>
          <ul className="space-y-2 text-sm font-medium">
            {platformLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path} className="text-blue-50 hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-widest">Support</h3>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/#documentation" className="text-blue-50 hover:text-white transition-colors">Documentation</Link></li>
            <li><a href="mailto:support@bytelearn.com" className="text-blue-50 hover:text-white transition-colors">Contact Support</a></li>
            <li><Link to="/#help" className="text-blue-50 hover:text-white transition-colors">Help Center</Link></li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-widest">Legal</h3>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/#privacy" className="text-blue-50 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/#terms" className="text-blue-50 hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-blue-100/70 text-xs">
          © {currentYear} ByteLearn. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-blue-100/70 text-xs font-medium">System Status: All systems operational</span>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
