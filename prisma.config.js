// Prisma 7 configuration file
// We use a plain JS object without imports to avoid "module not found" errors in Docker
module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
};
