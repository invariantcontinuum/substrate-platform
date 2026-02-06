/**
 * Signup Page
 * User registration form with email/password
 * Following DRY, KISS, and SOLID principles
 */

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building2,
  ArrowLeft, 
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';

// ============================================================================
// Types
// ============================================================================

interface SignupProps {
  onBack: () => void;
  onLogin: () => void;
  onSuccess: () => void;
}

// ============================================================================
// Components
// ============================================================================

export const Signup: React.FC<SignupProps> = ({ 
  onBack, 
  onLogin, 
  onSuccess 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const { register, isLoading, error, clearError } = useAuthStore();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  const validateStep1 = () => {
    return formData.name && formData.email && formData.password && formData.password.length >= 8;
  };

  const validateStep2 = () => {
    return formData.password === formData.confirmPassword && agreeTerms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName || undefined,
      });
      onSuccess();
    } catch {
      // Error is handled by the store
    }
  };

  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Details' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Substrate</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400">
              Start your journey with Substrate Platform
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      step >= s.number
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-500"
                    )}
                  >
                    {step > s.number ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step >= s.number ? "text-white" : "text-slate-500"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5",
                      step > s.number ? "bg-blue-600" : "bg-slate-800"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Create a strong password"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Must be at least 8 characters
                  </p>
                </div>

                {/* Next button */}
                <button
                  type="button"
                  onClick={() => validateStep1() && setStep(2)}
                  disabled={!validateStep1()}
                  className={cn(
                    "w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg text-white font-semibold transition-all",
                    !validateStep1() && "cursor-not-allowed"
                  )}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                {/* Confirm Password field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all",
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-slate-700"
                      )}
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Organization field (optional) */}
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-slate-300 mb-2">
                    Organization name
                    <span className="text-slate-500 ml-1">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      id="organization"
                      value={formData.organizationName}
                      onChange={(e) => updateField('organizationName', e.target.value)}
                      placeholder="Your company or team"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50"
                  />
                  <span className="text-sm text-slate-400">
                    I agree to the{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                  </span>
                </label>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !validateStep2()}
                    className={cn(
                      "flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2",
                      (isLoading || !validateStep2()) && "cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button
                onClick={onLogin}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 mb-3">
            Free forever. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-600">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              SOC 2
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              GDPR
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              ISO 27001
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
