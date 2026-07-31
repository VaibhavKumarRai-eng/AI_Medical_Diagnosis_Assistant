import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple password strength indicators
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-transparent', width: 'w-0' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !fullName || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        email,
        password,
        full_name: fullName
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Registration failed. Please make sure email is not already taken.'
      );
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
            <UserPlus className="h-6 w-6 text-current" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-med-text' : 'text-white'}`}>Create Account</h2>
          <p className={`mt-1.5 text-xs ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
            Join to check symptoms and consult our diagnostic virtual assistant.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-xl flex items-start gap-2.5 text-xs border ${
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
            className={`p-3 rounded-xl flex items-start gap-2.5 text-xs border ${
              isLight ? 'bg-green-50 border-green-200 text-green-950' : 'bg-green-500/[0.04] border border-green-500/20 text-green-200'
            }`}
          >
            <CheckCircle className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="fullName" className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 text-left">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input pl-10.5 w-full px-4 py-2.5 text-xs"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10.5 w-full px-4 py-2.5 text-xs"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              {/* Strength Meter */}
              {password && (
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
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 text-left">
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
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-400 pt-1 text-left">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 rounded bg-white/[0.02] border-white/10 text-primary focus:ring-primary/20 cursor-pointer"
            />
            <label htmlFor="terms" className={`ml-2 cursor-pointer leading-normal ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
              I agree to the educational-only disclaimer and project terms.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50 font-poppins"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={`text-center mt-6 text-xs ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
