/**
 * Authentication Service
 * Handles login, logout, registration, and token management
 * Following SOLID principles - Single Responsibility for auth operations
 */

import { BaseService } from './base';
import type {
  User,
  UserPreferences,
} from '@/types';

// Auth tokens type
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// Request types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string | null;
}

// Response types
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

/**
 * Auth Service - Handles authentication operations
 */
class AuthService extends BaseService {
  protected readonly basePath = '/auth';

  // Registration
  register(request: RegisterRequest) {
    return this.post<AuthResponse>('/register', request);
  }

  // Login
  login(request: LoginRequest) {
    return this.post<AuthResponse>('/login', request);
  }

  // Logout
  logout() {
    return this.post<void>('/logout', {});
  }

  // Refresh token
  refreshToken(request: RefreshTokenRequest) {
    return this.post<TokenResponse>('/refresh', request);
  }

  // Forgot password
  forgotPassword(request: ForgotPasswordRequest) {
    return this.post<void>('/forgot-password', request);
  }

  // Reset password
  resetPassword(request: ResetPasswordRequest) {
    return this.post<void>('/reset-password', request);
  }

  // Verify email
  verifyEmail(request: VerifyEmailRequest) {
    return this.post<void>('/verify-email', request);
  }
}

/**
 * User Service - Handles user profile and account operations
 */
class UserService extends BaseService {
  protected readonly basePath = '/users';

  // Get current user
  getCurrentUser() {
    return this.get<User>('/me');
  }

  // Update current user
  updateCurrentUser(request: UpdateUserRequest) {
    return this.patch<User>('/me', request);
  }

  // Change password
  changePassword(request: ChangePasswordRequest) {
    return this.put<void>('/me/password', request);
  }

  // Get user preferences
  getPreferences() {
    return this.get<UserPreferences>('/me/preferences');
  }

  // Update user preferences
  updatePreferences(preferences: UserPreferences) {
    return this.put<UserPreferences>('/me/preferences', preferences);
  }

  // Get active sessions
  getSessions() {
    return this.get<UserSession[]>('/me/sessions');
  }

  // Revoke session
  revokeSession(sessionId: string) {
    return this.del<void>(`/me/sessions/${sessionId}`);
  }
}

// Export singleton instances
export const authService = new AuthService();
export const userService = new UserService();
