import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Activity, MessageSquare, History, Shield, LogOut, User, LogIn, Bell, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Premium navigation notifications mock
  const notifications = [
    { id: 1, text: "AI Diagnostic Engine updated to v2.4", time: "2h ago" },
    { id: 2, text: "New consultation record stored in archives", time: "1d ago" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-dark-bg/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 text-white font-extrabold text-lg tracking-tight hover:opacity-90 transition-opacity">
              <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <span className="text-gradient font-sans font-bold bg-clip-text">Aegis AI</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1.5">
            {isAuthenticated ? (
              <>
                <Link to="/checker" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <span className="relative z-10 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Symptom Checker
                  </span>
                  {isActive('/checker') && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-white/[0.04] border border-white/[0.06] rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>

                <Link to="/chatbot" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-secondary" />
                    AI Chatbot
                  </span>
                  {isActive('/chatbot') && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-white/[0.04] border border-white/[0.06] rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>

                <Link to="/history" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <span className="relative z-10 flex items-center gap-2">
                    <History className="h-4 w-4 text-accent" />
                    Consultations
                  </span>
                  {isActive('/history') && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-white/[0.04] border border-white/[0.06] rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    <span className="relative z-10 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      Admin Panel
                    </span>
                    {isActive('/admin') && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-white/[0.04] border border-white/[0.06] rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )}

                {/* Vertical Divider */}
                <div className="h-4 w-px bg-white/10 mx-2" />

                {/* Notifications Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer relative"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full ring-2 ring-[#0B1120] animate-pulse" />
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2.5 w-80 glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl z-50 text-left"
                        >
                          <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/5">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Alert Center</span>
                            <span className="text-[10px] text-primary hover:underline cursor-pointer">Mark all read</span>
                          </div>
                          <div className="space-y-3 mt-2">
                            {notifications.map(n => (
                              <div key={n.id} className="text-xs hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer">
                                <p className="text-gray-200 leading-normal">{n.text}</p>
                                <span className="text-[9px] text-gray-500 mt-1 block">{n.time}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className={`p-2 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all ${
                    isActive('/profile') ? 'text-primary' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Profile Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 ml-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-4.5 py-2 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
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
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors cursor-pointer"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-dark-bg/95 border-b border-white/[0.06] overflow-hidden text-left"
          >
            <div className="px-4 py-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/checker"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive('/checker') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Activity className="h-4 w-4 text-primary" />
                    Symptom Checker
                  </Link>
                  <Link
                    to="/chatbot"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive('/chatbot') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 text-secondary" />
                    AI Chatbot
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive('/history') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <History className="h-4 w-4 text-accent" />
                    Consultations
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive('/admin') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <Shield className="h-4 w-4 text-purple-400" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive('/profile') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    Profile & Settings
                  </Link>
                  <div className="h-px bg-white/5 my-2" />
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/5 border border-white/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block text-center bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
