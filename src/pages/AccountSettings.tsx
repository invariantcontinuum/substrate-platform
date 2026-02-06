/**
 * Account Settings Page
 * User profile, preferences, and security settings
 * Following DRY, KISS, and SOLID principles
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Bell,
  Shield,
  Key,
  Palette,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Code,
  Building,
  Briefcase,
  Box,
  Layout,
  Terminal,
  Boxes,
  BarChart3,
  LayoutDashboard,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';
import { usePreferenceOptions } from '@/api/hooks';
import type { UserPreferences } from '@/types';

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<string, React.ElementType> = {
  Moon,
  Sun,
  Monitor,
  Code,
  Terminal,
  Building,
  Boxes,
  Briefcase,
  BarChart3,
  Shield,
  Box,
  Layout,
  LayoutDashboard,
  Layers,
};

const getIconComponent = (iconName: string): React.ElementType => {
  return iconMap[iconName] || Box;
};

// ============================================================================
// Components
// ============================================================================

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
      active
        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const ProfileSection: React.FC = () => {
  const { user, updateUser, isLoading } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    try {
      await updateUser({ name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Profile</h2>
        <p className="text-slate-400">Manage your public profile information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
            <Camera className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div>
          <p className="text-white font-medium">Profile picture</p>
          <p className="text-sm text-slate-500">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-500">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Profile updated successfully</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save changes
        </button>
      </form>
    </div>
  );
};

const PreferencesSection: React.FC = () => {
  const { user, updatePreferences } = useAuthStore();
  const { data: preferenceOptions, isLoading } = usePreferenceOptions();
  
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    theme: user?.preferences?.theme || 'dark',
    defaultView: user?.preferences?.defaultView || 'engineer',
    language: user?.preferences?.language || 'en',
    timezone: user?.preferences?.timezone || 'UTC',
    notifications: user?.preferences?.notifications,
  });

  const handleSave = async () => {
    try {
      await updatePreferences(preferences);
    } catch {
      // Error handled by store
    }
  };

  const themes = preferenceOptions?.themes || [];
  const languages = preferenceOptions?.languages || [];
  const timezones = preferenceOptions?.timezones || [];
  const dashboardViews = preferenceOptions?.dashboardViews || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Preferences</h2>
        <p className="text-slate-400">Customize your Substrate experience</p>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Theme
        </label>
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading themes...</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => {
              const Icon = getIconComponent(theme.icon);
              return (
                <button
                  key={theme.value}
                  onClick={() => setPreferences(p => ({ ...p, theme: theme.value as 'dark' | 'light' | 'system' }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                    preferences.theme === theme.value
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{theme.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Default View */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Default Dashboard View
        </label>
        <select
          value={preferences.defaultView}
          onChange={(e) => setPreferences(p => ({ ...p, defaultView: e.target.value as UserPreferences['defaultView'] }))}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <option>Loading...</option>
          ) : (
            dashboardViews.map((view) => (
              <option key={view.value} value={view.value}>
                {view.label}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Language
        </label>
        <select
          value={preferences.language}
          onChange={(e) => setPreferences(p => ({ ...p, language: e.target.value }))}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <option>Loading...</option>
          ) : (
            languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Timezone
        </label>
        <select
          value={preferences.timezone}
          onChange={(e) => setPreferences(p => ({ ...p, timezone: e.target.value }))}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <option>Loading...</option>
          ) : (
            timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))
          )}
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        Save preferences
      </button>
    </div>
  );
};

const NotificationsSection: React.FC = () => {
  const { user, updatePreferences } = useAuthStore();
  const { data: preferenceOptions, isLoading } = usePreferenceOptions();
  
  const [notifications, setNotifications] = useState({
    driftAlerts: user?.preferences?.notifications?.driftAlerts || 'digest',
    policyViolations: user?.preferences?.notifications?.policyViolations || 'digest',
    connectorSync: user?.preferences?.notifications?.connectorSync ?? true,
    emailDigest: user?.preferences?.notifications?.emailDigest || 'weekly',
    browserNotifications: user?.preferences?.notifications?.browserNotifications ?? true,
  });

  const handleSave = async () => {
    try {
      await updatePreferences({ notifications });
    } catch {
      // Error handled by store
    }
  };

  const notificationFrequencies = preferenceOptions?.notificationFrequencies || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Notifications</h2>
        <p className="text-slate-400">Control how and when you receive updates</p>
      </div>

      <div className="space-y-4">
        {/* Drift Alerts */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium text-white">Drift Alerts</p>
                <p className="text-sm text-slate-500">Notifications about architecture drift</p>
              </div>
            </div>
            <select
              value={notifications.driftAlerts}
              onChange={(e) => setNotifications(n => ({ ...n, driftAlerts: e.target.value as 'immediate' | 'digest' | 'none' }))}
              disabled={isLoading}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <option>Loading...</option>
              ) : (
                notificationFrequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Policy Violations */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-medium text-white">Policy Violations</p>
                <p className="text-sm text-slate-500">Alerts for policy breaches</p>
              </div>
            </div>
            <select
              value={notifications.policyViolations}
              onChange={(e) => setNotifications(n => ({ ...n, policyViolations: e.target.value as 'immediate' | 'digest' | 'none' }))}
              disabled={isLoading}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <option>Loading...</option>
              ) : (
                notificationFrequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Email Digest */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-medium text-white">Email Digest</p>
                <p className="text-sm text-slate-500">Summary email frequency</p>
              </div>
            </div>
            <select
              value={notifications.emailDigest}
              onChange={(e) => setNotifications(n => ({ ...n, emailDigest: e.target.value as 'daily' | 'weekly' | 'none' }))}
              disabled={isLoading}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <option>Loading...</option>
              ) : (
                notificationFrequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <span className="text-white">Connector sync notifications</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.connectorSync}
              onChange={(e) => setNotifications(n => ({ ...n, connectorSync: e.target.checked }))}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-white">Browser notifications</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.browserNotifications}
              onChange={(e) => setNotifications(n => ({ ...n, browserNotifications: e.target.checked }))}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600"
            />
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        Save notification settings
      </button>
    </div>
  );
};

const SecuritySection: React.FC = () => {
  const { changePassword, isLoading } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Security</h2>
        <p className="text-slate-400">Manage your password and security settings</p>
      </div>

      {/* Change Password */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">Change Password</h3>
            <p className="text-sm text-slate-500">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
            minLength={8}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Password changed successfully</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className={cn(
              "px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2",
              (isLoading || !currentPassword || !newPassword || !confirmPassword) && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Update password
          </button>
        </form>
      </div>

      {/* Two Factor */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-500">Add an extra layer of security</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-colors">
            Enable
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">Active Sessions</h3>
            <p className="text-sm text-slate-500">Manage your active devices</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
            <div>
              <p className="text-sm text-white font-medium">Current Session</p>
              <p className="text-xs text-slate-500">Chrome on macOS • IP: 192.168.1.1</p>
            </div>
            <span className="text-xs text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-full">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Account Settings Component
// ============================================================================

export const AccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-slate-400">
          Manage your profile, preferences, and security settings
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'preferences' && <PreferencesSection />}
            {activeTab === 'notifications' && <NotificationsSection />}
            {activeTab === 'security' && <SecuritySection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
