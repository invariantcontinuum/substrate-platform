/**
 * Authentication Store
 * Manages authentication state, user session, and auth operations
 * Following SOLID principles - Single Responsibility for auth state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { env, isDevelopment } from '@/config/env';
import type { User, UserPreferences } from '@/types';
import { authService, authUserService as userService } from '@/api/services';

// ============================================================================
// Types
// ============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions - Authentication
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Actions - User Management
  fetchCurrentUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Actions - Password Reset
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  
  // Actions - Session Management
  clearError: () => void;
  setAuthenticated: (value: boolean) => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  user: null as User | null,
  tokens: null as AuthTokens | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
};

// ============================================================================
// Store Creation
// ============================================================================

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get, store) => ({
        ...initialState,

        // ============================================================================
        // Authentication Actions
        // ============================================================================

        login: async (credentials) => {
          set({ isLoading: true, error: null }, false, 'auth/login/start');
          
          try {
            const response = await authService.login(credentials);
            const { user, tokens } = response.data;
            
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            }, false, 'auth/login/success');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            set({ isLoading: false, error: message }, false, 'auth/login/error');
            throw error;
          }
        },

        register: async (credentials) => {
          set({ isLoading: true, error: null }, false, 'auth/register/start');
          
          try {
            const response = await authService.register(credentials);
            const { user, tokens } = response.data;
            
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            }, false, 'auth/register/success');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            set({ isLoading: false, error: message }, false, 'auth/register/error');
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true }, false, 'auth/logout/start');
          
          try {
            await authService.logout();
          } catch {
            // Ignore logout errors
          } finally {
            // Always clear local state
            set({
              ...initialState,
              isLoading: false,
            }, false, 'auth/logout/complete');
            
            // Clear persisted state
            localStorage.removeItem('auth-store');
          }
        },

        refreshToken: async () => {
          const { tokens } = get();
          if (!tokens?.refreshToken) return;
          
          try {
            const response = await authService.refreshToken({
              refreshToken: tokens.refreshToken,
            });
            
            set({
              tokens: {
                ...tokens,
                accessToken: response.data.accessToken,
                expiresIn: response.data.expiresIn,
              },
            }, false, 'auth/refresh/success');
          } catch (error) {
            // If refresh fails, logout
            get().logout();
            throw error;
          }
        },

        // ============================================================================
        // User Management Actions
        // ============================================================================

        fetchCurrentUser: async () => {
          try {
            const response = await userService.getCurrentUser();
            set({ user: response.data }, false, 'auth/fetchUser/success');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch user';
            set({ error: message }, false, 'auth/fetchUser/error');
            throw error;
          }
        },

        updateUser: async (data) => {
          set({ isLoading: true, error: null }, false, 'auth/updateUser/start');
          
          try {
            const response = await userService.updateCurrentUser({
              name: data.name,
              avatar: data.avatar,
            });
            
            set({
              user: response.data,
              isLoading: false,
            }, false, 'auth/updateUser/success');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update user';
            set({ isLoading: false, error: message }, false, 'auth/updateUser/error');
            throw error;
          }
        },

        updatePreferences: async (preferences) => {
          const { user } = get();
          if (!user) throw new Error('No user logged in');
          
          try {
            const currentNotifs = user.preferences?.notifications;
            const newPreferences: UserPreferences = {
              theme: preferences.theme || user.preferences?.theme || 'dark',
              defaultView: preferences.defaultView || user.preferences?.defaultView || 'engineer',
              notifications: {
                driftAlerts: preferences.notifications?.driftAlerts || currentNotifs?.driftAlerts || 'digest',
                policyViolations: preferences.notifications?.policyViolations || currentNotifs?.policyViolations || 'digest',
                connectorSync: preferences.notifications?.connectorSync ?? currentNotifs?.connectorSync ?? true,
                emailDigest: preferences.notifications?.emailDigest || currentNotifs?.emailDigest || 'weekly',
                browserNotifications: preferences.notifications?.browserNotifications ?? currentNotifs?.browserNotifications ?? true,
              },
              language: preferences.language || user.preferences?.language,
              timezone: preferences.timezone || user.preferences?.timezone,
            };
            
            const response = await userService.updatePreferences(newPreferences);
            
            set({
              user: {
                ...user,
                preferences: response.data,
              },
            }, false, 'auth/updatePreferences/success');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update preferences';
            set({ error: message }, false, 'auth/updatePreferences/error');
            throw error;
          }
        },

        changePassword: async (currentPassword, newPassword) => {
          set({ isLoading: true, error: null }, false, 'auth/changePassword/start');
          
          try {
            await userService.changePassword({
              currentPassword,
              newPassword,
            });
            
            set({ isLoading: false }, false, 'auth/changePassword/success');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to change password';
            set({ isLoading: false, error: message }, false, 'auth/changePassword/error');
            throw error;
          }
        },

        // ============================================================================
        // Password Reset Actions
        // ============================================================================

        forgotPassword: async (email) => {
          set({ isLoading: true, error: null }, false, 'auth/forgotPassword/start');
          
          try {
            await authService.forgotPassword({ email });
            set({ isLoading: false }, false, 'auth/forgotPassword/success');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send reset email';
            set({ isLoading: false, error: message }, false, 'auth/forgotPassword/error');
            throw error;
          }
        },

        resetPassword: async (token, newPassword) => {
          set({ isLoading: true, error: null }, false, 'auth/resetPassword/start');
          
          try {
            await authService.resetPassword({ token, newPassword });
            set({ isLoading: false }, false, 'auth/resetPassword/success');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reset password';
            set({ isLoading: false, error: message }, false, 'auth/resetPassword/error');
            throw error;
          }
        },

        verifyEmail: async (token) => {
          set({ isLoading: true, error: null }, false, 'auth/verifyEmail/start');
          
          try {
            await authService.verifyEmail({ token });
            
            // Update user emailVerified status
            const { user } = get();
            if (user) {
              set({
                user: { ...user, emailVerified: true } as User,
                isLoading: false,
              }, false, 'auth/verifyEmail/success');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to verify email';
            set({ isLoading: false, error: message }, false, 'auth/verifyEmail/error');
            throw error;
          }
        },

        // ============================================================================
        // Utility Actions
        // ============================================================================

        clearError: () => {
          set({ error: null }, false, 'auth/clearError');
        },

        setAuthenticated: (value) => {
          set({ isAuthenticated: value }, false, 'auth/setAuthenticated');
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          tokens: state.tokens,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore', enabled: isDevelopment && env.VITE_ENABLE_ZUSTAND_DEVTOOLS }
  )
);

// ============================================================================
// Computed Selectors
// ============================================================================

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useUserPreferences = () => useAuthStore((state) => state.user?.preferences);
export const useIsEmailVerified = () => useAuthStore((state) => state.user?.emailVerified ?? false);
