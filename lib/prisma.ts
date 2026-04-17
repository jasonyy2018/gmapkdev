import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// In Prisma 7, the datasource url is no longer in schema.prisma,
// so we must pass it explicitly to the PrismaClient constructor.
const datasourceUrl = process.env.DATABASE_URL || 'file:./dev.db'

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
