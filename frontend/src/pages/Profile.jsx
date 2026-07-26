import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react';

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
        current_password: currentPassword,
        new_password: newPassword
      });
      setPassSuccess('Password updated successfully.');
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
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-left">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Account Profile</h1>
        <p className="text-sm text-gray-400">Manage your patient registration details and security parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Overview */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 h-fit text-center space-y-4">
          <div className="mx-auto h-20 w-20 bg-brand-500/10 rounded-full flex items-center justify-center border border-brand-500/20">
            <User className="h-10 w-10 text-brand-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user?.full_name}</h3>
            <p className="text-xs text-gray-400 capitalize">{user?.role} Account</p>
          </div>
          <div className="border-t border-white/5 pt-4 text-left space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-500 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-500 shrink-0" />
              <span>Status: <b className="text-green-400">Active</b></span>
            </div>
          </div>
        </div>

        {/* Right column: Edit forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-brand-500" />
              Profile Details
            </h3>
            
            {profileError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg flex items-start gap-2.5 text-sm mb-4">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}
            
            {profileSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-lg flex items-start gap-2.5 text-sm mb-4">
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="glass-input w-full px-4 py-2.5 text-sm opacity-50 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Contact system admin to modify account email.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {profileLoading ? 'Updating...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-brand-500" />
              Update Password
            </h3>

            {passError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg flex items-start gap-2.5 text-sm mb-4">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-lg flex items-start gap-2.5 text-sm mb-4">
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 text-sm"
                    placeholder="At least 8 chars"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 text-sm"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {passLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
