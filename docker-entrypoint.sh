#!/bin/sh
set -e

echo "Starting database initialization..."
# Be extremely explicit to ensure Prisma 7 works correctly in Docker
# We pass the schema and force the datasource URL via environment variable inline
DATABASE_URL="file:/app/dev.db" npx prisma db push --accept-data-loss --schema ./prisma/schema.prisma

echo "Database initialized. Starting Next.js..."
exec node server.js
