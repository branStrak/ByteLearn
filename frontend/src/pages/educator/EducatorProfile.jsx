import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Save, 
  ArrowLeft, 
  Phone, 
  Calendar, 
  UserCircle, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Landmark,
  CreditCard,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EducatorHeader from '../../components/layout/EducatorHeader';
import Footer from '../../components/layout/Footer';

const EducatorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removePic, setRemovePic] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { name, email, phone, gender, dateOfBirth, bankDetails, profilePicture } = res.data;
      if (profilePicture && profilePicture !== 'default-profile.jpg') {
        setPreviewUrl(profilePicture);
      }
      setFormData({
        name: name || '',
        email: email || '',
        phone: phone || '',
        gender: gender || '',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : '',
        bankDetails: {
          accountName: bankDetails?.accountName || '',
          accountNumber: bankDetails?.accountNumber || '',
          bankName: bankDetails?.bankName || ''
        }
      });
    } catch (err) {
      console.error("Error fetching educator profile:", err);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e) => {
    setFormData({
      ...formData,
      bankDetails: {
        ...formData.bankDetails,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePic(false);
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    setRemovePic(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('email', formData.email);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('gender', formData.gender);
      dataToSend.append('dateOfBirth', formData.dateOfBirth);

      if (formData.bankDetails.accountName) dataToSend.append('bankDetails[accountName]', formData.bankDetails.accountName);
      if (formData.bankDetails.accountNumber) dataToSend.append('bankDetails[accountNumber]', formData.bankDetails.accountNumber);
      if (formData.bankDetails.bankName) dataToSend.append('bankDetails[bankName]', formData.bankDetails.bankName);

      if (profilePicture) {
        dataToSend.append('profilePicture', profilePicture);
      } else if (removePic) {
        dataToSend.append('removeProfilePicture', 'true');
      }

      const res = await axios.put('/api/auth/profile', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local storage if name changed
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = res.data.name;
      user.profilePicture = res.data.profilePicture;
      localStorage.setItem('user', JSON.stringify(user));

      toast.success("Profile updated successfully!");
      if (res.data.otpToken) {
         toast.success("Please verify your new email.");
         navigate('/verify-otp', { 
           state: { 
             email: formData.email, 
             otpToken: res.data.otpToken 
           } 
         });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const fallbackAvatar = formData.name 
    ? `https://ui-avatars.com/api/?name=${formData.name}&background=EFF6FF&color=2563EB`
    : `https://ui-avatars.com/api/?name=Educator&background=EFF6FF&color=2563EB`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <EducatorHeader educatorName="Loading..." />
        <div className="flex-grow flex items-center justify-center">
           <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <EducatorHeader educatorName={formData.name} />
      
      <main className="flex-grow max-w-[900px] w-full mx-auto px-6 py-10">
        
        <button 
          onClick={() => navigate('/educator-dashboard')} 
          className="flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors uppercase tracking-widest text-xs gap-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
             <div className="absolute -bottom-12 left-10 flex items-end gap-4">
                <div className="w-28 h-28 bg-white rounded-3xl p-1 shadow-lg relative cursor-pointer group" onClick={() => document.getElementById('profileUpdateInput').click()}>
                   <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 overflow-hidden relative">
                      <img 
                        src={previewUrl || fallbackAvatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-white text-xs font-bold uppercase tracking-widest text-center">Change<br/>Photo</span>
                      </div>
                   </div>
                   <input 
                     type="file" 
                     id="profileUpdateInput" 
                     className="hidden" 
                     accept="image/*"
                     onChange={handleFileChange}
                   />
                </div>
                {(previewUrl || profilePicture) && (
                  <button 
                    type="button"
                    onClick={handleRemovePicture}
                    className="mb-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
             </div>
          </div>

          <div className="pt-20 px-10 pb-10">
            <div className="mb-10">
               <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Educator Profile</h1>
               <p className="text-slate-500 font-medium">Manage your professional identity and contact information.</p>
            </div>
            
            <form className="space-y-8" onSubmit={handleSubmit}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                
                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block">Updating email will require re-verification</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Gender Identity</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type="date" 
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-10 border-t border-slate-100 mt-10">
                <div className="mb-8">
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Payout Settings</h3>
                   <p className="text-slate-500 font-medium text-sm mt-1">Provide your banking details to receive your course earnings.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  {/* Account Name */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Account Holder Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        name="accountName"
                        value={formData.bankDetails.accountName}
                        onChange={handleBankChange}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="e.g. User Test"
                      />
                    </div>
                  </div>
                  {/* Account Number */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Account Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CreditCard size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        name="accountNumber"
                        value={formData.bankDetails.accountNumber}
                        onChange={handleBankChange}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="e.g. 123456789"
                      />
                    </div>
                  </div>
                  {/* Bank Name / IFSC */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Routing Code / IFSC</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Landmark size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        name="bankName"
                        value={formData.bankDetails.bankName}
                        onChange={handleBankChange}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase"
                        placeholder="e.g. HDFC000123"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 mt-12 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-400">
                   <AlertCircle size={16} />
                   <p className="text-[11px] font-bold uppercase tracking-wider">Ensure your details match your legal IDs for payouts.</p>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)}
                    className="px-8 py-4 text-slate-500 font-black text-xs uppercase tracking-[0.15em] hover:bg-slate-50 rounded-2xl transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSaving ? "Saving..." : "Update Portfolio"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EducatorProfile;
