#!/bin/bash
# Database Reset Script
# This script resets your Neon database to a clean state

echo "⚠️  WARNING: This will delete ALL data from your database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it in your .env.local file or export it:"
    echo "export DATABASE_URL='your-connection-string'"
    exit 1
fi

echo "🔄 Resetting database..."
psql "$DATABASE_URL" -f scripts/reset-and-init.sql

if [ $? -eq 0 ]; then
    echo "✅ Database reset successfully!"
else
    echo "❌ Error resetting database. Please check your connection string and try again."
    exit 1
fi
