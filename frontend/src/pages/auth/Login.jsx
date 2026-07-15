import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginResponse = (data, email) => {
    const userData = data?.data || data;
    const token = userData.token || data.token;

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log("Token and User metadata saved to session");
    }

    const { role, isVerified, educatorApplication } = userData;
    console.log("Session Role Index:", role);

    if (isVerified === false) {
      navigate('/verify-otp', { state: { email, otpToken: userData.otpToken } });
      return;
    }

    if (role === 'student') {
      navigate('/student-dashboard');
    } else if (role === 'admin') {
      navigate('/admin-dashboard');
    } else if (role === 'educator') {
      const status = educatorApplication?.status;
      console.log("Educator Status found:", status);
      if (status === 'pending') {
        navigate('/educator-status');
      } else if (status === 'approved') {
        navigate('/educator-dashboard');
      } else if (status === 'rejected') {
        navigate('/educator-rejected');
      } else {
        navigate('/educator-status');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      console.log("Login Response Data:", res.data);
      handleLoginResponse(res.data, email);
    } catch (err) {
      const errorMessage = err.response?.data?.message || '';
      console.error("Login catch block error:", err.response || err);
      
      if (err.response?.status === 403 && errorMessage.toLowerCase().includes('not verified')) {
        navigate('/verify-otp', { 
          state: { 
            email, 
            otpToken: err.response.data.otpToken 
          } 
        });
      } else {
        setError(errorMessage || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/google', { 
        token: credentialResponse.credential 
      });
      console.log("Google Login Response Data:", res.data);
      handleLoginResponse(res.data, res.data.email);
    } catch (err) {
      console.error("Google Login error:", err.response || err);
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-slate-100 p-8">

        { }
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-blue-600 mb-6">
            <GraduationCap size={32} />
            <span className="text-2xl font-bold text-slate-800 tracking-tight">ByteLearn</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1 text-center">Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error.split('support@bytelearn.com').map((part, i, arr) => 
               i < arr.length - 1 ? (
                 <span key={i}>
                   {part}
                   <a href="mailto:support@bytelearn.com" className="font-bold underline hover:text-red-700">support@bytelearn.com</a>
                 </span>
               ) : (
                 <span key={i}>{part}</span>
               )
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 bg-slate-50 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70"
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            width="100%"
            theme="outline"
            shape="rectangular"
          />
        </div>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-600 mb-4">
            Don't have an account?
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register-student"
              className="flex-1 py-2 px-4 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Student
            </Link>
            <Link
              to="/apply-educator"
              className="flex-1 py-2 px-4 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Educator
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
