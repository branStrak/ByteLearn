import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Compass, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  TrendingUp, 
  Award,
  ChevronDown,
  GraduationCap,
  LogOut,
  User as UserIcon
} from 'lucide-react';

const DashboardHeader = ({ studentName = 'Student', fullWidth = false }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(studentName);
  const [profilePic, setProfilePic] = useState(null);
  const [hasUnreadQueries, setHasUnreadQueries] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (studentName && studentName !== 'Student') {
      setProfileName(studentName);
      return; 
    }
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/auth/profile', config);
        if (res.data) {
          if (res.data.name) setProfileName(res.data.name);
          if (res.data.profilePicture && res.data.profilePicture !== 'default-profile.jpg') {
            setProfilePic(res.data.profilePicture);
          }
        }
      } catch (err) {
        console.error("DashboardHeader failed to fetch profile name", err);
      }
    };
    fetchProfileData();

    const checkUnreadQueries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/api/queries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.data) {
           const hasUnread = res.data.data.some(q => q.status === 'resolved' && !q.studentRead);
           setHasUnreadQueries(hasUnread);
        }
      } catch (err) {
        console.error("DashboardHeader failed to check unread queries", err);
      }
    };
    checkUnreadQueries();
  }, [studentName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsProfileOpen(false);
    navigate('/update-profile');
  };
  const navItems = [
    { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
    { name: 'Browse', path: '/browse', icon: BookOpen },
    { name: 'My Courses', path: '/my-courses', icon: GraduationCap },
    { name: 'My Queries', path: '/student/queries', icon: MessageSquare, hasBadge: hasUnreadQueries },
    { name: 'Certificates', path: '/certificates', icon: Award },
  ];

  const fallbackPic = profileName 
    ? `https://ui-avatars.com/api/?name=${profileName}&background=EFF6FF&color=2563EB`
    : `https://ui-avatars.com/api/?name=Student&background=EFF6FF&color=2563EB`;

  return (
    <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] shadow-md">
      <div className={`${fullWidth ? 'w-full px-4' : 'max-w-[1400px] mx-auto px-6'} h-[65px] flex items-center justify-between`}>
        
        {/* Logo */}
        <div className="flex items-center gap-2 text-white mr-8">
          <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center">
            <GraduationCap size={22} className="text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ByteLearn</span>
        </div>

        {/* Navigation */}
        <nav className="hidden xl:flex items-center justify-center gap-2 text-[13px] font-bold flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 rounded-xl transition-all relative ${
                  isActive 
                    ? 'bg-white text-[#2563EB] shadow-xl shadow-blue-900/20' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <item.icon size={15} />
              {item.name}
              {item.hasBadge && (
                 <span className={`absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ${isActive ? 'bg-white' : ''}`}></span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-3 ml-8 relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-full flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
               <img src={profilePic || fallbackPic} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-bold text-white leading-tight truncate max-w-[120px]">{profileName}</p>
              <p className="text-[11px] text-blue-100 font-medium">Student</p>
            </div>
            <ChevronDown size={14} className="text-blue-100 ml-1 flex-shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <button 
                onClick={handleEditProfile}
                className="w-full text-left px-4 py-2.5 text-[14px] text-slate-700 font-medium hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <UserIcon size={16} /> Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[14px] text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default DashboardHeader;
