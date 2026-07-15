import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import axios from 'axios';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    educationLevel: ''
  });
  const [showOptional, setShowOptional] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword' && formData[key] !== '') {
          dataToSend.append(key, formData[key]);
        }
      });

      if (profilePicture) {
        dataToSend.append('profilePicture', profilePicture);
      }

      const res = await axios.post('/api/auth/register-student', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/verify-otp', { 
        state: { 
          email: formData.email,
          otpToken: res.data.otpToken
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-slate-100 p-8">

        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-blue-600 mb-6">
            <GraduationCap size={32} />
            <span className="text-2xl font-bold text-slate-800 tracking-tight">ByteLearn</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Student Account</h1>
          <p className="text-slate-500 text-sm mt-1">Start your learning journey today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Required Fields */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Priya patel"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="plpatel@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>

          {/* Optional Fields Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors w-full justify-center"
            >
              {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showOptional ? 'Hide Optional Profile Information' : 'Add Optional Profile Information (Phone, Gender, etc.)'}
            </button>
          </div>

          {/* Optional Fields Section */}
          {showOptional && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm appearance-none"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Education Level</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm appearance-none"
                >
                  <option value="">Select Level</option>
                  <option value="high_school">High School</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Profile Picture Section */}
              <div className="md:col-span-2 pt-2">
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-slate-800">Profile Picture</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Upload a photo to personalize your account</p>
                </div>

                <div
                  className="w-full border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center py-6 cursor-pointer transition-colors text-center"
                  onClick={() => document.getElementById('profilePicInput').click()}
                >
                  <Upload size={24} className="text-slate-500 mb-2" />
                  {profilePicture ? (
                    <span className="text-sm font-medium text-blue-600">{profilePicture.name}</span>
                  ) : (
                    <span className="text-sm text-slate-500 font-medium">Click to upload your image</span>
                  )}

                  <input
                    type="file"
                    id="profilePicInput"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70"
            >
              <CheckCircle2 size={18} />
              {loading ? 'Creating...' : 'Create Student Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default StudentRegister;
