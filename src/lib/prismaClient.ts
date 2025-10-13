import type { PrismaClient as PrismaClientType } from '@prisma/client'; // ✅ Type only import
const { PrismaClient } = require('@prisma/client'); // ✅ CommonJS import

// Extend globalThis with prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

// Create the PrismaClient instance
const prisma: PrismaClientType = globalThis.prisma || new PrismaClient();

// In development, store in globalThis to avoid multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Export using CommonJS syntax
module.exports = { prisma };
