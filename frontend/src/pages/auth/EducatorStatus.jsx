import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, LogOut, CheckCircle2, Clock, Mail } from 'lucide-react';

const EducatorStatus = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 py-12 h-screen overflow-y-auto w-full">
      <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>

        {/* Visual Indicator */}
        <div className="flex justify-center mb-6 mt-2">
          <div className="w-24 h-24 bg-gradient-to-tr from-amber-50 to-orange-50 rounded-full flex items-center justify-center text-amber-500 shadow-inner relative border border-amber-100">
            <div className="absolute inset-0 rounded-full border border-amber-400 animate-ping opacity-20"></div>
            <ClipboardList size={48} className="animate-pulse drop-shadow-sm" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
          Application Under Review
        </h2>

        {/* Primary Message */}
        <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2">
          Thank you for applying to be an educator on <span className="font-semibold text-slate-700">ByteLearn</span>! Our team is currently reviewing your uploaded credentials.
        </p>

        {/* Beautiful Horizontal Stepper */}
        <div className="flex justify-center mb-8 px-4">
          <div className="flex items-center w-full max-w-[300px]">
            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10 w-1/3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-2.5 uppercase tracking-wider">Applied</span>
            </div>
            
            {/* Connector 1 */}
            <div className="flex-1 h-[2px] bg-emerald-100 -mt-6"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10 w-1/3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm">
                 <CheckCircle2 size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-2.5 uppercase tracking-wider">Verified</span>
            </div>

            {/* Connector 2 */}
            <div className="flex-1 h-[2px] bg-amber-100 -mt-6"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10 w-1/3">
              <div className="w-10 h-10 rounded-full bg-white text-amber-500 flex items-center justify-center border-2 border-amber-300 shadow-sm relative">
                 <div className="absolute inset-0 rounded-full bg-amber-100 opacity-50 animate-pulse"></div>
                 <Clock size={18} className="relative z-10" />
              </div>
              <span className="text-[10px] font-bold text-amber-600 mt-2.5 uppercase tracking-wider">Reviewing</span>
            </div>
          </div>
        </div>

        {/* Timeline Expectation */}
        <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100 flex items-start text-left gap-3">
          <div className="mt-0.5 text-blue-500 bg-blue-50 p-1.5 rounded-lg">
            <Mail size={16} />
          </div>
          <p className="text-slate-600 text-xs leading-5">
            This administrative process typically takes <strong className="text-slate-800">1 to 3 business days</strong>. We will notify you via email the moment your profile is approved.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleLogout}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200 outline-none ring-2 ring-transparent focus:ring-slate-200 shadow-sm hover:shadow"
          >
            <LogOut size={18} className="text-slate-400" />
            Sign Out For Now
          </button>

          {/* Support Link */}
          <div className="pt-3">
            <a 
              href="mailto:support@bytelearn.com" 
              className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
            >
              Need help? Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EducatorStatus;
