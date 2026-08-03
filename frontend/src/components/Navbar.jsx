import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Activity, MessageSquare, History, Shield, LogOut, Settings, Bell, Sun, Moon, User, Utensils } from 'lucide-react';
import AegisLogo from './AegisLogo';

const Navbar = () => {
  const { logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Navigation notifications mock
  const notifications = [
    { id: 1, text: "AI Diagnostic Engine updated to v2.4", time: "2h ago" },
    { id: 2, text: "New consultation record stored in archives", time: "1d ago" },
  ];

  if (theme === 'light') {
    // Render Light Theme Navbar
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-med-secondary bg-[#FFFFFF]/85 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 text-med-text font-extrabold text-xl tracking-tight hover:opacity-95 transition-opacity font-poppins">
                <AegisLogo className="h-10 w-10 shrink-0" theme="light" />
                <div className="flex flex-col text-left">
                  <span className="font-bold tracking-tight text-[#1A1A1A] leading-tight">
                    Aegis <span className="text-med-primary">AI</span>
                  </span>
                  <span className="text-[9px] font-medium tracking-normal text-med-gray leading-none mt-0.5 font-sans">
                    by STVS by Vaibhav Kumar Rai
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                to="/about-project" 
                className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors font-inter ${
                  isActive('/about-project') ? 'text-med-primary bg-med-secondary/60' : 'text-med-gray hover:text-med-primary hover:bg-med-secondary/30'
                }`}
              >
                About Project
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl flex items-center justify-center transition-colors hover:bg-med-secondary/50 text-med-gray hover:text-med-primary cursor-pointer mr-1"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/checker" 
                    className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors font-inter ${
                      isActive('/checker') ? 'text-med-primary bg-med-secondary/60' : 'text-med-gray hover:text-med-primary hover:bg-med-secondary/30'
                    }`}
                  >
                    Symptom Checker
                  </Link>

                  <Link 
                    to="/chatbot" 
                    className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors font-inter ${
                      isActive('/chatbot') ? 'text-med-primary bg-med-secondary/60' : 'text-med-gray hover:text-med-primary hover:bg-med-secondary/30'
                    }`}
                  >
                    AI Chatbot
                  </Link>

                  <Link 
                    to="/doctor-consultation" 
                    className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors font-inter ${
                      isActive('/doctor-consultation') ? 'text-med-primary bg-med-secondary/60' : 'text-med-gray hover:text-med-primary hover:bg-med-secondary/30'
                    }`}
                  >
                    Consult Doctors
                  </Link>

                  <Link 
                    to="/diet-planner" 
                    className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors font-inter ${
                      isActive('/diet-planner') ? 'text-med-primary bg-med-secondary/60' : 'text-med-gray hover:text-med-primary hover:bg-med-secondary/30'
                    }`}
                  >
                    Diet Planner
                  </Link>

                  <Link 
                    to="/history" 
                    className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors font-inter ${
                      isActive('/history') ? 'text-med-primary bg-med-secondary/60' : 'text-med-gray hover:text-med-primary hover:bg-med-secondary/30'
                    }`}
                  >
                    Consultations
                  </Link>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors font-inter ${
                        isActive('/admin') ? 'text-med-primary bg-med-secondary/60' : 'text-med-gray hover:text-med-primary hover:bg-med-secondary/30'
                      }`}
                    >
                      Admin Panel
                    </Link>
                  )}

                  {/* Divider */}
                  <div className="h-4 w-px bg-med-secondary mx-1" />

                  {/* Settings */}
                  <Link
                    to="/profile"
                    className={`p-2 rounded-xl flex items-center justify-center transition-colors hover:bg-med-secondary/50 ${
                      isActive('/profile') ? 'text-med-primary' : 'text-med-gray hover:text-med-primary'
                    }`}
                    title="Profile Settings"
                  >
                    <Settings className="h-4.5 w-4.5" />
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-100"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-semibold text-med-gray hover:text-med-primary transition-colors font-inter"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-med-primary hover:bg-med-accent hover:shadow-premium-md text-white font-semibold px-6 py-2.5 rounded-full text-sm shadow-premium-sm transition-all hover:-translate-y-0.5 font-inter"
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
                className="inline-flex items-center justify-center p-2 rounded-xl text-med-gray hover:text-med-primary hover:bg-med-secondary focus:outline-none transition-colors cursor-pointer"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              className="md:hidden bg-white border-b border-med-secondary overflow-hidden text-left"
            >
              <div className="px-4 py-4 space-y-2">
                <Link
                  to="/about-project"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                    isActive('/about-project') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                  }`}
                >
                  <Activity className="h-4.5 w-4.5 text-med-primary" />
                  About Project
                </Link>

                <button
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-med-gray hover:bg-med-secondary/40 cursor-pointer"
                >
                  {theme === 'light' ? <Moon className="h-4.5 w-4.5 text-med-gray" /> : <Sun className="h-4.5 w-4.5 text-med-gray" />}
                  <span>Switch Theme</span>
                </button>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/checker"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                        isActive('/checker') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                      }`}
                    >
                      <Activity className="h-4.5 w-4.5 text-med-primary" />
                      Symptom Checker
                    </Link>
                    <Link
                      to="/chatbot"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                        isActive('/chatbot') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                      }`}
                    >
                      <MessageSquare className="h-4.5 w-4.5 text-med-accent" />
                      AI Chatbot
                    </Link>
                    <Link
                      to="/doctor-consultation"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                        isActive('/doctor-consultation') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                      }`}
                    >
                      <User className="h-4.5 w-4.5 text-blue-500" />
                      Consult Doctors
                    </Link>
                    <Link
                      to="/diet-planner"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                        isActive('/diet-planner') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                      }`}
                    >
                      <Utensils className="h-4.5 w-4.5 text-emerald-500" />
                      Diet Planner
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                        isActive('/history') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                      }`}
                    >
                      <History className="h-4.5 w-4.5 text-purple-500" />
                      Consultations
                    </Link>
                    <Link
                      to="/privacy-policy"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                        isActive('/privacy-policy') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                      }`}
                    >
                      <Shield className="h-4.5 w-4.5 text-green-500" />
                      Privacy & Security
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                          isActive('/admin') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                        }`}
                      >
                        <Shield className="h-4.5 w-4.5 text-red-500" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter ${
                        isActive('/profile') ? 'bg-med-secondary text-med-primary' : 'text-med-gray hover:bg-med-secondary/40'
                      }`}
                    >
                      <Settings className="h-4.5 w-4.5 text-gray-500" />
                      Profile Settings
                    </Link>
                    <div className="h-px bg-med-secondary my-2" />
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-center px-4 py-3 rounded-2xl text-base font-semibold text-med-gray border border-med-secondary hover:bg-med-secondary/20"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="text-center bg-med-primary hover:bg-med-accent text-white px-4 py-3 rounded-2xl text-base font-semibold shadow-premium-sm"
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
    }
  
    // Render Dark Dashboard Navbar
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0b1120]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2.5 text-white font-extrabold text-lg tracking-tight hover:opacity-90 transition-opacity font-poppins">
                <AegisLogo className="h-9 w-9 shrink-0" theme="dark" />
                <div className="flex flex-col text-left">
                  <span className="text-gradient font-sans font-bold bg-clip-text leading-tight">
                    Aegis AI
                  </span>
                  <span className="text-[8px] font-medium tracking-normal text-gray-400 leading-none mt-0.5 font-sans">
                    by STVS by Vaibhav Kumar Rai
                  </span>
                </div>
              </Link>
            </div>
  
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-1.5">
              <Link to="/about-project" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                <span className="relative z-10 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  About Project
                </span>
                {isActive('/about-project') && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/[0.04] border border-white/[0.06] rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer mr-2"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-gray-400 hover:text-white" /> : <Moon className="h-4 w-4 text-gray-400 hover:text-white" />}
              </button>

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

                  <Link to="/doctor-consultation" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    <span className="relative z-10 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      Consult Doctors
                    </span>
                    {isActive('/doctor-consultation') && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-white/[0.04] border border-white/[0.06] rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
  
                  <Link to="/diet-planner" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    <span className="relative z-10 flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-emerald-400" />
                      Diet Planner
                    </span>
                    {isActive('/diet-planner') && (
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
                    className="flex items-center gap-2 ml-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-50/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
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
                <Link
                  to="/about-project"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive('/about-project') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Activity className="h-4 w-4 text-primary" />
                  About Project
                </Link>

                <button
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 text-gray-400" /> : <Moon className="h-4 w-4 text-gray-400" />}
                  <span className="ml-0.5">Switch Theme</span>
                </button>

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
                      to="/doctor-consultation"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive('/doctor-consultation') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <User className="h-4 w-4 text-blue-400" />
                      Consult Doctors
                    </Link>
                    <Link
                      to="/diet-planner"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive('/diet-planner') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <Utensils className="h-4 w-4 text-emerald-400" />
                      Diet Planner
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
                    <Link
                      to="/privacy-policy"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive('/privacy-policy') ? 'bg-primary/10 text-white' : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <Shield className="h-4 w-4 text-green-400" />
                      Privacy & Security
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
