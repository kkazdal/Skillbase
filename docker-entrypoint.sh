#!/bin/sh
set -e

echo "🚀 SkillBase Docker Entrypoint Starting..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "postgres" -c '\q' 2>/dev/null; do
  echo "   PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# Create database if it doesn't exist
echo "📦 Checking database..."
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "postgres" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_DATABASE'" | grep -q 1 || \
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "postgres" -c "CREATE DATABASE $DB_DATABASE"
echo "✅ Database ready!"

# Run migrations
echo "🔄 Running database migrations..."
npm run migration:run || {
  echo "⚠️  Migration failed, but continuing..."
}

# Run SDK tests if in development mode (skip if SDK not available)
if [ "$NODE_ENV" = "development" ] && [ -d "/app/sdk" ]; then
  echo "🧪 Running SDK workflow tests..."
  if [ -f "/app/sdk/package.json" ]; then
    cd /app/sdk
    # Install SDK dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
      echo "   Installing SDK dependencies..."
      npm install --silent || {
        echo "⚠️  SDK dependencies installation failed, skipping tests..."
        cd /app
      }
    fi
    # Run tests (non-blocking)
    npm test || {
      echo "⚠️  SDK tests failed, but continuing..."
    }
    cd /app
  fi
fi

# Start the application
echo "🎯 Starting SkillBase API..."
exec node dist/api/src/main.js

