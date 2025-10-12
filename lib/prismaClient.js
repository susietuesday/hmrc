const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = global.prisma || prisma;
}

module.exports = { prisma };
