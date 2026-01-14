#!/bin/bash

# Database creation script for SkillBase
# This script creates the skillbase database if it doesn't exist

set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_DATABASE:-skillbase}

echo "Creating database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USERNAME"

# Try to create database using psql
if command -v psql &> /dev/null; then
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database might already exist or connection failed"
  echo "Database creation attempted via psql"
else
  echo "psql not found. Please create the database manually:"
  echo ""
  echo "Option 1: Using pgAdmin"
  echo "  1. Open pgAdmin"
  echo "  2. Connect to PostgreSQL"
  echo "  3. Right-click 'Databases' → Create → Database"
  echo "  4. Name: $DB_NAME"
  echo ""
  echo "Option 2: Using psql (if available)"
  echo "  psql -U $DB_USERNAME -c 'CREATE DATABASE $DB_NAME;'"
  echo ""
  echo "Option 3: Using Docker"
  echo "  docker exec -it <postgres-container> psql -U $DB_USERNAME -c 'CREATE DATABASE $DB_NAME;'"
fi

