import { PrismaClient } from '@prisma/client';

// Singleton — reuse the same client across the server lifetime.
// Prisma 7: pass datasourceUrl directly since schema.prisma no longer has url field.
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export default prisma;
