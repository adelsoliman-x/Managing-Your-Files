/**
 * =========================================================================================
 * CloudVault Workspace - Authentication & RBAC Middleware
 * =========================================================================================
 * Handles JSON Web Token (JWT) generation, cryptographic verification,
 * request user hydration, and Role-Based Access Control (RBAC) route guards.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { AuthJWTPayload, User } from '../types.js';

/**
 * Extended Express Request interface attaching verified user and token payload.
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
  tokenPayload?: AuthJWTPayload;
}

// Fallback JWT secret for local development environments
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_managing_your_files_2026';

/**
 * Generates a signed JWT for authenticated sessions.
 * 
 * @param {AuthJWTPayload} payload - Essential user identity and role claims
 * @returns {string} Signed JWT with 7-day expiration time
 */
export function signToken(payload: AuthJWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Cryptographically verifies and decodes an incoming JWT token string.
 * 
 * @param {string} token - Bearer token extracted from HTTP Authorization header
 * @returns {AuthJWTPayload | null} Decoded payload or null if invalid/expired
 */
export function verifyToken(token: string): AuthJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthJWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Express Middleware: Authenticates incoming requests via Bearer JWT.
 * Validates token integrity, verifies user account existence, and checks account status.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Missing or malformed Bearer token.' 
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired authentication token. Please sign in again.' 
    });
    return;
  }

  // Hydrate user record from persistent storage
  const user = db.users.findById(payload.userId);
  if (!user) {
    res.status(401).json({ 
      success: false, 
      message: 'User account not found or has been removed.' 
    });
    return;
  }

  // Check administrative suspension status
  if (user.status === 'SUSPENDED') {
    res.status(403).json({ 
      success: false, 
      message: 'Your account has been suspended by an administrator.' 
    });
    return;
  }

  // Attach hydrated identity context to the Express request
  req.user = user;
  req.tokenPayload = payload;
  next();
}

/**
 * Express Middleware: Restricts route access strictly to users with the 'ADMIN' role.
 * Must be mounted after `authenticateToken`.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Administrator privileges are required to perform this action.' 
    });
    return;
  }
  next();
}
