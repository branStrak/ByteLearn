import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookCheck, 
  UserCog, 
  LogOut,
  ShieldCheck,
  Bell,
  IndianRupee
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Educator Approvals', path: '/admin/educators', icon: <ShieldCheck size={20} /> },
    { name: 'Course Approvals', path: '/admin/courses', icon: <BookCheck size={20} /> },
    { name: 'Financials', path: '/admin/earnings', icon: <IndianRupee size={20} /> },
    { name: 'User Management', path: '/admin/users', icon: <UserCog size={20} /> },
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 bg-[#0F172A] text-slate-300 flex flex-col shadow-2xl border-r border-slate-800">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
             <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter">ByteLearn</h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Admin Control</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1' 
                  : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-800/50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
