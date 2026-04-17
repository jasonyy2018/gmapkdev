#!/bin/sh
set -e

echo "Starting database initialization..."
npx prisma migrate deploy

echo "Database initialized. Starting Next.js..."
exec node server.js
