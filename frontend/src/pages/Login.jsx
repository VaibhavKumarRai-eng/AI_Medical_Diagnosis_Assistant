import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Incorrect email or password. Please try again.'
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
            <LogIn className="h-6 w-6 text-current" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-med-text' : 'text-white'}`}>Welcome Back</h2>
          <p className={`mt-1.5 text-xs ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
            Sign in to check symptoms and view consultations.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-xl flex items-start gap-2.5 text-xs border ${
              isLight ? 'bg-red-50 border-red-200 text-red-950' : 'bg-red-500/[0.04] border-red-500/20 text-red-200'
            }`}
          >
            <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                Email Address
              </label>
              <div className="relative text-left">
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

            {/* Password Field */}
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10.5 pr-10.5 w-full px-4 py-2.5 text-xs"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3.5 flex items-center focus:outline-none cursor-pointer ${
                    isLight ? 'text-med-gray hover:text-med-primary' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded bg-white/[0.02] border-white/10 text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor="remember-me" className={`ml-2 cursor-pointer ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                Remember me
              </label>
            </div>
            
            <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50 font-poppins"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={`mt-6 text-center text-xs ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
          <span>New to Aegis? </span>
          <Link to="/register" className="font-bold text-primary hover:underline">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
