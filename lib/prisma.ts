import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// For Prisma 7 with SQLite, we don't need a complex adapter unless using Turso.
// The connection URL is read from process.env.DATABASE_URL automatically 
// because we added it back to the schema.prisma file.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
