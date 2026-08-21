/**
 * =========================================================================================
 * CloudVault Workspace - Prisma Client Singleton Instance
 * =========================================================================================
 * Manages database connection pooling and lifecycle for PostgreSQL / MySQL.
 * Prevents multiple active connection pool leaks during development hot reloads.
 */

import { PrismaClient } from '@prisma/client';

// Global reference prevents connection pool exhaustion in development environments
let prismaInstance: PrismaClient | null = null;

/**
 * Retrieves or instantiates the global PrismaClient singleton.
 * 
 * @returns {PrismaClient} Connected Prisma client instance
 */
export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

export const prisma = getPrisma();
