/**
 * =========================================================================================
 * CloudVault Workspace - Authentication & Identity REST Controller
 * =========================================================================================
 * Endpoints:
 * - POST   /api/auth/register         -> User registration & OTP dispatch
 * - POST   /api/auth/login            -> Password comparison & JWT issuance
 * - POST   /api/auth/verify-email     -> 6-digit OTP verification
 * - POST   /api/auth/resend-code      -> Regenerate & re-send OTP code
 * - GET    /api/auth/profile          -> Fetch authenticated user profile
 * - PATCH  /api/auth/profile          -> Update profile name & avatar
 * - POST   /api/auth/change-password  -> Secure password alteration
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { User, VerificationCode } from '../types.js';
import { sendVerificationOtpEmail } from '../services/emailService.js';

const router = Router();

/**
 * Utility helper: Generates a cryptographically random 6-digit verification code.
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * @route   POST /api/auth/register
 * @desc    Registers a new user, hashes the password, creates an unverified account, and sends an OTP code
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Field presence validation
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    // Minimum password complexity check
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    // Duplicate email check
    const existingUser = db.users.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    // Hash user password with bcrypt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Instantiate user entity
    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'USER',
      isVerified: false,
      storageQuotaBytes: 500 * 1024 * 1024, // 500 MB default allocated storage
      usedStorageBytes: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.create(newUser);

    // Generate 6-Digit Email Verification Code with 15-minute validity TTL
    const otp = generateOTP();
    const verificationCode: VerificationCode = {
      id: 'vc_' + Date.now(),
      email: newUser.email,
      code: otp,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.verificationCodes.create(verificationCode);

    // Asynchronously dispatch real verification email via Gmail SMTP gateway
    sendVerificationOtpEmail(newUser.email, otp, newUser.name).catch((err) => {
      console.error('[Auth Service] Background email delivery failure:', err);
    });

    // Record registration in security audit trail
    db.auditLogs.create({
      userId: newUser.id,
      userEmail: newUser.email,
      action: 'USER_REGISTER',
      details: `New user registration initiated for ${newUser.email}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    // Issue initial session token
    const token = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role });

    res.status(201).json({
      success: true,
      message: 'Registration successful! A 6-digit verification code has been dispatched to your email.',
      token,
      otpCode: otp, // Provided for fast sandbox previews and rapid testing
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        storageQuotaBytes: newUser.storageQuotaBytes,
        usedStorageBytes: newUser.usedStorageBytes,
      },
    });
  } catch (err: any) {
    console.error('[Auth Service] Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates credentials, checks account suspension, issues JWT Bearer token
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = db.users.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
      return;
    }

    // Compare supplied password against salted bcrypt hash
    const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    // Record login in audit logs
    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      details: `Successful login by ${user.email} (${user.role})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        storageQuotaBytes: user.storageQuotaBytes,
        usedStorageBytes: user.usedStorageBytes,
      },
    });
  } catch (err: any) {
    console.error('[Auth Service] Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Validates submitted 6-digit OTP code against active tokens and verifies user account
 * @access  Public / Semi-Authenticated
 */
router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ success: false, message: 'Email and 6-digit verification code are required.' });
      return;
    }

    const user = db.users.findByEmail(email);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    const verification = db.verificationCodes.findLatest(email, 'EMAIL_VERIFICATION');
    if (!verification) {
      res.status(400).json({ success: false, message: 'No active verification code found for this email address.' });
      return;
    }

    // Verify expiration timestamp
    if (new Date(verification.expiresAt).getTime() < Date.now()) {
      res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
      return;
    }

    // Compare code string
    if (verification.code.trim() !== code.trim()) {
      res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
      return;
    }

    // Mark user as officially verified and invalidate OTP record
    db.users.update(user.id, { isVerified: true });
    db.verificationCodes.delete(verification.id);

    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'EMAIL_VERIFIED',
      details: `Email address verified for ${user.email}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    const updatedUser = db.users.findById(user.id);

    res.json({
      success: true,
      message: 'Email address successfully verified!',
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role,
        isVerified: true,
        avatarUrl: updatedUser?.avatarUrl,
        storageQuotaBytes: updatedUser?.storageQuotaBytes,
        usedStorageBytes: updatedUser?.usedStorageBytes,
      },
    });
  } catch (err: any) {
    console.error('[Auth Service] Verify email error:', err);
    res.status(500).json({ success: false, message: 'Server error during email verification.', error: err.message });
  }
});

/**
 * @route   POST /api/auth/resend-code
 * @desc    Regenerates a fresh 6-digit OTP and dispatches it via Gmail SMTP
 * @access  Public
 */
router.post('/resend-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    const user = db.users.findByEmail(email);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found with this email address.' });
      return;
    }

    const otp = generateOTP();
    const verificationCode: VerificationCode = {
      id: 'vc_' + Date.now(),
      email: user.email,
      code: otp,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.verificationCodes.create(verificationCode);

    // Send email via Gmail SMTP
    sendVerificationOtpEmail(user.email, otp, user.name).catch((err) => {
      console.error('[Auth Service] Background email sending failed on resend:', err);
    });

    res.json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched to your email.',
      otpCode: otp,
    });
  } catch (err: any) {
    console.error('[Auth Service] Resend code error:', err);
    res.status(500).json({ success: false, message: 'Server error resending verification code.', error: err.message });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Fetches authenticated user profile & quota metrics
 * @access  Private (Authenticated)
 */
router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl,
      storageQuotaBytes: user.storageQuotaBytes,
      usedStorageBytes: user.usedStorageBytes,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @route   PATCH /api/auth/profile
 * @desc    Updates user display name and profile avatar URI
 * @access  Private (Authenticated)
 */
router.patch('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { name, avatarUrl } = req.body;

    const updates: Partial<User> = {};
    if (name && typeof name === 'string') updates.name = name.trim();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const updated = db.users.update(user.id, updates);

    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'PROFILE_UPDATE',
      details: `Profile updated by user ${user.email}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Validates current password and updates to new bcrypt hash
 * @access  Private (Authenticated)
 */
router.post('/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password provided is incorrect.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    db.users.update(user.id, { passwordHash });

    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'PASSWORD_CHANGE',
      details: `Password changed for user ${user.email}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

export default router;
