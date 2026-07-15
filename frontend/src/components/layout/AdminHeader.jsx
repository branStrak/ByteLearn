import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  BookCheck,
  UserCog,
  IndianRupee
} from 'lucide-react';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [adminName, setAdminName] = useState(adminUser?.name || 'Admin');
  const [profilePic, setProfilePic] = useState(adminUser.profilePicture && adminUser.profilePicture !== 'default-profile.jpg' ? adminUser.profilePicture : null);

  const fallbackPic = adminName 
    ? `https://ui-avatars.com/api/?name=${adminName}&background=EFF6FF&color=2563EB`
    : `https://ui-avatars.com/api/?name=Admin&background=EFF6FF&color=2563EB`;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data) {
          if (data.name) setAdminName(data.name);
          if (data.profilePicture && data.profilePicture !== 'default-profile.jpg') {
            setProfilePic(data.profilePicture);
          } else if (data.profilePicture === 'default-profile.jpg') {
            setProfilePic(null);
          }
        }
      } catch (err) {
        console.error("AdminHeader failed to fetch profile data", err);
      }
    };
    fetchProfileData();

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin-dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Educator Approvals', path: '/admin/educators', icon: <ShieldCheck size={16} /> },
    { name: 'Course Approvals', path: '/admin/courses', icon: <BookCheck size={16} /> },
    { name: 'Financials', path: '/admin/earnings', icon: <IndianRupee size={16} /> },
    { name: 'User Management', path: '/admin/users', icon: <UserCog size={16} /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] shadow-md">
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo added */}
        <div className="flex items-center">
          <Link to="/admin-dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="hidden sm:inline">ByteLearn</span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-1 mx-8 relative">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${isActive
                  ? 'bg-white text-[#2563EB] shadow-xl shadow-blue-900/10'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-xl transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/20 shadow-sm overflow-hidden flex-shrink-0">
               <img src={profilePic || fallbackPic} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-white leading-none">{adminName}</p>
              <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest mt-1">Admin</p>
            </div>
            <ChevronDown size={14} className={`text-blue-100 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <button
                onClick={handleLogout}
                className="w-[calc(100%-8px)] flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-all mx-1 rounded-lg"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default AdminHeader;
