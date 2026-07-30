import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Shield, AlertCircle, CheckCircle, Settings, ShieldCheck, X } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [showPassSuccessModal, setShowPassSuccessModal] = useState(false);
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    if (!fullName) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    setProfileLoading(true);
    try {
      await authAPI.updateProfile({ full_name: fullName });
      await refreshUser();
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }

    setPassLoading(true);
    try {
      await authAPI.changePassword({
        old_password: currentPassword,
        new_password: newPassword
      });
      setPassSuccess('Password updated successfully.');
      setShowPassSuccessModal(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPassError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-left relative grid-bg">
      <div className="border-b border-white/[0.06] pb-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          Account Settings
        </h1>
        <p className="text-xs text-gray-400 mt-1.5">Manage patient profile details, contact emails, and security credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/[0.06] h-fit text-center space-y-5 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.15)]">
            <User className="h-9 w-9 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{user?.full_name}</h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1.5 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md inline-block">
              {user?.role} Account
            </p>
          </div>
          <div className="border-t border-white/5 pt-4 text-left space-y-3.5 text-xs text-gray-300">
            <div className="flex items-center gap-2.5 bg-white/[0.01] p-3 rounded-xl border border-white/5">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/[0.01] p-3 rounded-xl border border-white/5">
              <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
              <span>Status: <b className="text-accent font-extrabold">Active</b></span>
            </div>
          </div>
        </motion.div>

        {/* Right column: Edit forms */}
        <div className="lg:col-span-8 space-y-8">
          {/* Edit Profile Form */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-3xl border border-white/[0.06] shadow-xl"
          >
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              Personal Information
            </h3>
            
            {profileError && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs mb-4">
                <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}
            
            {profileSuccess && (
              <div className="bg-green-500/10 border border-green-500/25 text-green-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs mb-4">
                <CheckCircle className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-xs font-semibold"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="glass-input w-full px-4 py-2.5 text-xs opacity-50 cursor-not-allowed"
                />
                <p className="text-[9px] text-gray-500 mt-1">To change registered email, contact administrator.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-50"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Change Password Form */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-3xl border border-white/[0.06] shadow-xl"
          >
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-primary" />
              Credentials Security
            </h3>

            {passError && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs mb-4">
                <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="bg-green-500/10 border border-green-500/25 text-green-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs mb-4">
                <CheckCircle className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-xs"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 text-xs"
                    placeholder="At least 8 chars"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 text-xs"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-50"
                >
                  {passLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Password Change Success Modal */}
      <AnimatePresence>
        {showPassSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPassSuccessModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-sm w-full bg-[#151e30] border border-green-500/20 rounded-[28px] p-6 shadow-2xl overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-500" />
              
              <button 
                onClick={() => setShowPassSuccessModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto h-12 w-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4 animate-bounce">
                <CheckCircle className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-white font-poppins">Success</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed font-inter">
                Your password has been successfully changed!
              </p>

              <div className="mt-6">
                <button
                  onClick={() => setShowPassSuccessModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-all cursor-pointer"
                >
                  Great
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
