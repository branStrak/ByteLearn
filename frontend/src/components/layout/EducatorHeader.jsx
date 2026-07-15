import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare,
  Users,
  ChevronDown,
  IndianRupee,
  User,
  LogOut,
  Settings
} from 'lucide-react';

const EducatorHeader = ({ educatorName, activePage }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [displayName, setDisplayName] = useState(educatorName && educatorName !== 'Educator' ? educatorName : (localUser.name || 'Educator'));
  const [profilePic, setProfilePic] = useState(localUser.profilePicture && localUser.profilePicture !== 'default-profile.jpg' ? localUser.profilePicture : null);

  const fallbackPic = displayName 
    ? `https://ui-avatars.com/api/?name=${displayName}&background=EFF6FF&color=2563EB`
    : `https://ui-avatars.com/api/?name=Educator&background=EFF6FF&color=2563EB`;

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
          if (data.name) setDisplayName(data.name);
          if (data.profilePicture && data.profilePicture !== 'default-profile.jpg') {
            setProfilePic(data.profilePicture);
          } else if (data.profilePicture === 'default-profile.jpg') {
            setProfilePic(null);
          }
        }
      } catch (err) {
        console.error("EducatorHeader failed to fetch profile data", err);
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

  const navLinks = [
    { name: 'Dashboard', path: '/educator-dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'My Courses', path: '/educator/courses', icon: <BookOpen size={16} /> },
    { name: 'Student Management', path: '/educator/student-management', icon: <Users size={16} /> },
    { name: 'Queries', path: '/educator/queries', icon: <MessageSquare size={16} /> },
    { name: 'Earnings', path: '/educator/earnings', icon: <IndianRupee size={16} /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] shadow-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/educator-dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <div className="bg-white/20 p-1.5 rounded-lg">
                 <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span>ByteLearn</span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1 mx-8 relative">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                  activePage === link.path 
                  ? 'bg-white text-[#2563EB] shadow-xl shadow-blue-900/10' 
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Profile Dropdown */}
          <div className="flex items-center relative" ref={profileRef}>
             <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer relative"
             >
               <div className="w-9 h-9 rounded-full border border-white/20 shadow-sm overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                 <img src={profilePic || fallbackPic} alt="Profile" className="w-full h-full object-cover" />
               </div>
               <div className="hidden sm:block text-left">
                 <p className="text-sm font-bold text-white leading-none">{displayName}</p>
                 <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest mt-1">Educator</p>
               </div>
               <ChevronDown size={14} className={`text-blue-100 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
             </div>

             {/* Dropdown Menu */}
             {isProfileOpen && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <button 
                    onClick={() => { 
                      setIsProfileOpen(false); 
                      navigate('/educator/profile'); 
                    }} 
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
               </div>
             )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default EducatorHeader;
