# Manual Installation Guide

This guide covers manual installation of SkillBase without Docker. For the fastest setup, we recommend using the [Quick Start](./QUICK_START.md) guide instead.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/)
- **npm** or **yarn**
- **Git** - [Download](https://git-scm.com/)

## Installation Steps

### 1. Clone and Install

```bash
git clone <repository-url>
cd Skillbase
npm install
```

### 2. Set Up PostgreSQL Database

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE skillbase;

# Exit
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=skillbase

# JWT Configuration
# ⚠️ IMPORTANT: Change this to a strong random string in production!
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET=your-secret-key-change-in-production-min-32-chars-long
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

**⚠️ Important**: Change `JWT_SECRET` to a strong random string in production (minimum 32 characters). You can generate one using:

```bash
openssl rand -base64 32
```

### 4. Create Database and Run Migrations

```bash
# Create database (if not exists)
npm run db:create

# Run database migrations
npm run migration:run
```

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### 6. Verify Installation

```bash
# Check API health
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"skillbase-api"}
```

## Development Commands

```bash
# Development mode (with hot reload)
npm run start:dev

# Build for production
npm run build

# Production mode
npm run start:prod

# Run tests
npm run test

# Run SDK workflow tests
cd sdk && npm test

# Linting
npm run lint

# Database commands
npm run db:create              # Create database
npm run migration:run           # Run migrations
npm run migration:revert        # Revert last migration
npm run migration:show          # Show migration status
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Windows
# Check Services panel
```

### Migration Issues

```bash
# Check migration status
npm run migration:show

# Run migrations manually
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert
```

### Port Already in Use

If port 3000 is already in use:

1. Edit `.env` file and change `PORT=3000` to another port (e.g., `PORT=3001`)
2. Restart the server

### Environment Variables Not Loading

Make sure:
- `.env` file exists in the root directory
- `.env` file has correct format (no spaces around `=`)
- Database credentials match your PostgreSQL setup

## Next Steps

After manual installation:

1. **Test the API**: `curl http://localhost:3000/health`
2. **Try the SDK**: See [SDK Documentation](./sdk/README.md)
3. **Run Tests**: `cd sdk && npm test`

## Alternative: Docker Setup

If you encounter issues with manual installation, consider using Docker:

```bash
npm run quick-start
```

See [QUICK_START.md](./QUICK_START.md) for Docker-based setup.

