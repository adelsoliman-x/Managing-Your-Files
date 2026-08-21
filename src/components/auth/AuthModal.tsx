import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'register' | 'verify';
  forced?: boolean; // cannot close if forced
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  forced = false,
}) => {
  const { login, register, verifyOtp, resendOtp, pendingVerificationEmail, lastGeneratedOtp } = useAuth();
  const { success, error } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
    if (pendingVerificationEmail) {
      setMode('verify');
      setEmail(pendingVerificationEmail);
    }
  }, [initialMode, pendingVerificationEmail]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please provide both email and password.');
      return;
    }
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);
    if (res.success) {
      success('Welcome back! Logged in successfully.');
      if (onClose) onClose();
    } else {
      error(res.message || 'Login failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('All fields are required.');
      return;
    }
    if (password.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    const res = await register(name, email, password);
    setIsSubmitting(false);
    if (res.success) {
      success('Account created! Please verify your email.');
      setMode('verify');
      if (res.otpCode) {
        setOtpCode(res.otpCode);
      }
    } else {
      error(res.message || 'Registration failed.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      error('Please enter the 6-digit OTP code.');
      return;
    }
    setIsSubmitting(true);
    const res = await verifyOtp(otpCode);
    setIsSubmitting(false);
    if (res.success) {
      success('Email successfully verified! You now have full access.');
      if (onClose) onClose();
    } else {
      error(res.message || 'Verification failed.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSubmitting(true);
    const res = await resendOtp();
    setIsSubmitting(false);
    if (res.success) {
      success('A new 6-digit code has been generated.');
      setResendCooldown(60);
      if (res.otpCode) {
        setOtpCode(res.otpCode);
      }
    } else {
      error(res.message || 'Failed to resend code.');
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass).then((res) => {
      if (res.success) {
        success(`Logged in as ${demoEmail.includes('admin') ? 'Administrator' : 'Demo User'}`);
        if (onClose) onClose();
      } else {
        error(res.message || 'Login failed');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header bar */}
        <div className="relative bg-gradient-to-r from-indigo-600/90 via-indigo-500/80 to-cyan-600/90 px-6 py-5 text-white border-b border-white/10">
          {!forced && onClose && (
            <button
              id="auth-modal-close"
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">CloudVault Storage</h2>
          </div>
          <p className="text-indigo-100 text-xs mt-1">
            {mode === 'login' && 'Sign in to access your secured files and dashboard.'}
            {mode === 'register' && 'Create your account to start uploading and organizing.'}
            {mode === 'verify' && 'Enter the 6-digit verification code sent to your email.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'verify' && (
          <div className="flex border-b border-white/10 bg-white/5">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
                mode === 'login'
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
                mode === 'register'
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Quick Demo Accounts Selection */}
          {mode === 'login' && (
            <div className="mb-5 p-3.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Demo 1-Click Login</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="quick-login-admin"
                  type="button"
                  onClick={() => handleQuickLogin('admin@example.com', 'Admin123')}
                  className="px-2.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Admin Account
                </button>
                <button
                  id="quick-login-user"
                  type="button"
                  onClick={() => handleQuickLogin('adel.s.atwan@gmail.com', 'Password123!')}
                  className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  User: Adel Atwan
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adel Atwan"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adel@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Verify</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center py-2">
                <div className="inline-flex p-3 bg-white/10 border border-white/10 text-indigo-400 rounded-full mb-2">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Email Verification OTP</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sent to: <span className="font-semibold text-slate-200">{email || pendingVerificationEmail}</span>
                </p>
              </div>

              {lastGeneratedOtp && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-amber-300">
                    <span>Generated Test OTP: </span>
                    <strong className="font-mono text-sm tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40 text-amber-200">
                      {lastGeneratedOtp}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(lastGeneratedOtp)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  6-Digit OTP Code
                </label>
                <input
                  id="verify-otp-input"
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-white/5 border border-white/10 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                id="verify-submit-btn"
                type="submit"
                disabled={isSubmitting || otpCode.length < 6}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Email & Complete Sign-in</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Back to Sign In
                </button>

                <button
                  id="verify-resend-btn"
                  type="button"
                  disabled={resendCooldown > 0 || isSubmitting}
                  onClick={handleResendOtp}
                  className="font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
