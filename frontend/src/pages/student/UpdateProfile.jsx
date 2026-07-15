import React, { useState, useEffect } from 'react';

import { User, Mail, Save, ArrowLeft, Upload, Trash2, Phone, GraduationCap, Calendar, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removePic, setRemovePic] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData({ 
        name: user.name || '', 
        email: user.email || '',
        phone: user.phone || '',
        educationLevel: user.educationLevel || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
      if (user.profilePicture && user.profilePicture !== 'default-profile.jpg') {
        setPreviewUrl(user.profilePicture);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('email', formData.email);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('educationLevel', formData.educationLevel);
      dataToSend.append('gender', formData.gender);
      dataToSend.append('dateOfBirth', formData.dateOfBirth);
      
      if (profilePicture) {
        dataToSend.append('profilePicture', profilePicture);
      } else if (removePic) {
        dataToSend.append('removeProfilePicture', 'true');
      }

      const res = await axios.put('/api/auth/profile', dataToSend, config);
      
      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...res.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      toast.success(res.data.message || 'Profile updated successfully!');
      if (res.data.isVerified === false) {
          navigate('/verify-otp', { 
            state: { 
              email: formData.email,
              otpToken: res.data.otpToken
            } 
          });
      } else {
          setTimeout(() => navigate(-1), 1000);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const fallbackAvatar = formData.name 
    ? `https://ui-avatars.com/api/?name=${formData.name}&background=EFF6FF&color=2563EB`
    : `https://ui-avatars.com/api/?name=User&background=EFF6FF&color=2563EB`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <main className="flex-grow max-w-[800px] w-full mx-auto px-6 py-10">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>
        
        <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Update Profile</h1>
          <p className="text-slate-500 text-[15px] mb-8">Manage your profile details and preferences.</p>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 flex-shrink-0 shadow-sm">
                <img 
                  src={previewUrl || fallbackAvatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => document.getElementById('profileUpdateInput').click()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[14px] transition-colors"
                  >
                    <Upload size={16} />
                    Change Picture
                  </button>
                  {(previewUrl || profilePicture) && (
                    <button 
                      type="button"
                      onClick={handleRemovePicture}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg text-[14px] transition-colors"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  id="profileUpdateInput" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-slate-400">Recommended: Square JPG, PNG. Max 5MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-slate-700">Education Level</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <GraduationCap size={18} className="text-slate-400" />
                  </div>
                  <select 
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium appearance-none"
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post-Graduate">Post-Graduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-slate-700">Gender</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserCircle size={18} className="text-slate-400" />
                  </div>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-slate-700">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="date" 
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-8 flex justify-end">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-slate-600 font-medium text-[14px] hover:bg-slate-50 rounded-xl transition-colors mr-3"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-[14px] transition-colors shadow-sm disabled:opacity-70"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default UpdateProfile;

