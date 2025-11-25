#!/bin/bash
# Quick database count checker

if [ -z "$DATABASE_URL" ]; then
    echo "Loading DATABASE_URL from .env.local..."
    export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found"
    exit 1
fi

echo "🔍 Checking database counts..."
psql "$DATABASE_URL" -f scripts/check-db-count.sql
