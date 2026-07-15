import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const initialOtpToken = location.state?.otpToken || '';

  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState(initialOtpToken);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  //if directly open this page then show msg that no email found
  useEffect(() => {
    if (!email) {
      setError("No email found to verify. Please register or login first.");
    }
    if (!otpToken && email) {
        setError("Verification token missing. Please try resending the OTP.");
    }
  }, [email, otpToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post('/api/auth/verify-otp', { email, otp, otpToken });
      setSuccess("Account successfully verified! Redirecting to login...");



      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post('/api/auth/resend-otp', { email });
      setOtpToken(res.data.otpToken);
      setSuccess(res.data.message || "A new OTP has been sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-sm border border-slate-100 p-8">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 text-center">Verify Email</h1>
          <p className="text-slate-500 text-sm mt-2 text-center leading-relaxed">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-slate-700">{email || 'your email'}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-100 text-center">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="otp"
              required
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => {
                // Only allow numbers
                const val = e.target.value.replace(/[^0-9]/g, '');
                setOtp(val);
              }}
              disabled={!email}
              className="w-full px-4 py-4 bg-slate-50 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-2xl text-center tracking-[1em] font-mono border border-transparent focus:border-blue-500/20 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || otp.length !== 6}
            className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending || !email}
              className="text-blue-600 font-medium hover:underline disabled:opacity-50 disabled:hover:no-underline"
            >
              {resending ? 'Sending...' : 'Click to resend'}
            </button>
          </p>
          <div className="mt-4">
            <Link to="/register-student" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              Return to registration
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;
