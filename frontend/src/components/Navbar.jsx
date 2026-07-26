import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Activity, MessageSquare, History, Shield, LogOut, User, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
    ${isActive(path) 
      ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20' 
      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
  `;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-wide hover:opacity-90">
              <Activity className="h-6 w-6 text-brand-500 animate-pulse-slow" />
              <span className="text-gradient">AI Medical Diagnosis Assistant</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link to="/checker" className={linkClass('/checker')}>
                  <Activity className="h-4 w-4" />
                  Symptom Checker
                </Link>
                <Link to="/chatbot" className={linkClass('/chatbot')}>
                  <MessageSquare className="h-4 w-4" />
                  AI Chatbot
                </Link>
                <Link to="/history" className={linkClass('/history')}>
                  <History className="h-4 w-4" />
                  Consultations
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={linkClass('/admin')}>
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                
                {/* User Profile dropdown or link */}
                <Link to="/profile" className={linkClass('/profile')}>
                  <User className="h-4 w-4" />
                  {user?.full_name?.split(' ')[0] || 'Profile'}
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass('/login')}>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-brand-500/20 transition-all duration-200"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-dark-bg/95 border-b border-white/5 py-3 px-4 space-y-2 animate-fadeIn">
          {isAuthenticated ? (
            <>
              <Link
                to="/checker"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <Activity className="h-5 w-5 text-brand-500" />
                Symptom Checker
              </Link>
              <Link
                to="/chatbot"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <MessageSquare className="h-5 w-5 text-brand-500" />
                AI Chatbot
              </Link>
              <Link
                to="/history"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <History className="h-5 w-5 text-brand-500" />
                Consultations
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  <Shield className="h-5 w-5 text-brand-500" />
                  Admin Panel
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <User className="h-5 w-5 text-brand-500" />
                Profile ({user?.full_name})
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/5 hover:text-red-300 cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white border border-white/5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg text-base font-medium shadow-md shadow-brand-500/20"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
