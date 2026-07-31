import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, Lock, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';

const ForgotPassword = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request OTP, 2 = verify & reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState(''); // Developer visual debug helper

  // Simple password strength indicators (matching Register.jsx)
  const getPasswordStrength = () => {
    if (!newPassword) return { label: 'Empty', color: 'bg-transparent', width: 'w-0' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    
    switch (score) {
      case 1:
        return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
      case 2:
        return { label: 'Moderate', color: 'bg-yellow-500', width: 'w-2/4' };
      case 3:
        return { label: 'Strong', color: 'bg-green-400', width: 'w-3/4' };
      case 4:
        return { label: 'Excellent', color: 'bg-accent', width: 'w-full' };
      default:
        return { label: 'Weak', color: 'bg-red-500', width: 'w-1/12' };
    }
  };

  const strength = getPasswordStrength();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevToken('');

    if (!email) {
      setError('Please input your email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email);
      setSuccess('OTP verification code sent! Please check your email inbox (or server console logs).');
      
      // If we are in local development mode, the FastAPI response includes the generated token
      if (data?.message && data.message.includes('Demonstrator Token:')) {
        const tokenMatch = data.message.split('Demonstrator Token: ')[1];
        if (tokenMatch) {
          setDevToken(tokenMatch.trim());
        }
      }
      
      // Progress to Step 2
      setTimeout(() => {
        setSuccess('');
        setStep(2);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all verification fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyOtp(email, otp, newPassword);
      setSuccess('Password updated successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'OTP verification failed. Incorrect or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative transition-colors duration-300 ${
      isLight ? 'grid-bg-light bg-white text-med-text' : 'grid-bg bg-dark-bg text-gray-300'
    }`}>
      {/* Background Orbs */}
      <div className={`glow-orb top-10 left-10 w-72 h-72 ${isLight ? 'bg-med-secondary' : 'bg-primary/10'}`} />
      <div className={`glow-orb bottom-10 right-10 w-72 h-72 ${isLight ? 'bg-[#EEF0FF]' : 'bg-secondary/10'}`} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`max-w-md w-full space-y-8 p-8 rounded-3xl relative overflow-hidden shadow-2xl transition-all duration-300 ${
          isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
        }`}
      >
        <div className="text-center">
          <div className={`mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-4 border ${
            isLight ? 'bg-med-secondary border-med-primary/10 text-med-primary' : 'bg-primary/10 border-primary/20 text-primary'
          }`}>
            <KeyRound className="h-6 w-6 text-current" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-med-text' : 'text-white'}`}>
            {step === 1 ? 'Password Recovery' : 'Reset Credentials'}
          </h2>
          <p className={`mt-1.5 text-xs ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
            {step === 1 
              ? 'Enter registered email to request a 6-digit OTP code.' 
              : 'Enter verification OTP code and your new account password.'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs border ${
              isLight ? 'bg-red-50 border-red-200 text-red-950' : 'bg-red-500/[0.04] border border-red-500/20 text-red-200'
            }`}
          >
            <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs border ${
              isLight ? 'bg-green-50 border-green-200 text-green-950' : 'bg-green-500/[0.04] border border-green-500/20 text-green-200'
            }`}
          >
            <CheckCircle className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Development Quick helper */}
        {devToken && step === 2 && (
          <div className={`p-3 rounded-xl flex flex-col gap-1 text-[11px] border ${
            isLight ? 'bg-primary/5 border-primary/20 text-med-text' : 'bg-primary/[0.04] border border-primary/20 text-primary'
          }`}>
            <span className={`font-bold uppercase tracking-wider text-[9px] ${isLight ? 'text-med-gray' : 'text-gray-505'}`}>Developer Testing Help</span>
            <span>FastAPI returned demo OTP: <b className={`select-all font-mono text-sm px-1.5 py-0.5 rounded border ml-1 ${
              isLight ? 'bg-med-secondary border-med-primary/10 text-med-primary' : 'bg-white/5 border border-white/10 text-white'
            }`}>{devToken}</b></span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleRequestOtp} 
              className="space-y-5 mt-4"
            >
              <div className="space-y-1.5 text-left">
                <label htmlFor="email" className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input pl-10.5 w-full px-4 py-2.5 text-xs"
                    placeholder="name@domain.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50 font-poppins"
              >
                {loading ? 'Sending OTP...' : (
                  <div className="flex items-center gap-1">
                    Send OTP Verification
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleResetPassword} 
              className="space-y-4 mt-4"
            >
              {/* OTP Code */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="otp" className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`glass-input pl-10.5 w-full px-4 py-2.5 text-xs tracking-[0.25em] font-mono text-center font-bold ${
                      isLight ? 'text-med-text' : 'text-white'
                    }`}
                    placeholder="000000"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="newPassword" className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input pl-10.5 w-full px-4 py-2.5 text-xs"
                    placeholder="At least 8 characters"
                  />
                </div>
                {/* Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <span>Strength: <b className={isLight ? 'text-med-text' : 'text-white'}>{strength.label}</b></span>
                    </div>
                    <div className={`h-1 w-full rounded-full overflow-hidden border ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/[0.04] border-white/5'}`}>
                      <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="confirmPassword" className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass-input pl-10.5 w-full px-4 py-2.5 text-xs"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50 font-poppins"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className={`w-full text-center text-xs underline cursor-pointer mt-1 ${isLight ? 'text-med-gray hover:text-med-primary' : 'text-gray-500 hover:text-gray-400'}`}
              >
                Back to step 1
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className={`text-center mt-6 text-xs ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
          Remember credentials?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
