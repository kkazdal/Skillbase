# SkillBase

**Game-first and education-first backend platform for developers**

SkillBase is a simple, fast, and open-source backend platform designed specifically for game and education developers. Unlike Firebase or Supabase's general-purpose approach, SkillBase offers a game-first and education-first experience with powerful event tracking, user management, and project organization.

## 🎯 What is SkillBase?

SkillBase is a self-hostable backend-as-a-service platform that provides:

- **Event Tracking**: Track game events, user progress, achievements, and analytics
- **User Management**: Authentication, user profiles, and session management
- **Project Management**: Organize multiple projects with API keys and environments
- **Mobile-Ready SDKs**: Official SDKs for JavaScript/TypeScript (React Native, Node.js, Browser) and Unity C#
- **Production-Ready**: Built with NestJS, PostgreSQL, and enterprise-grade architecture

## ✨ Features

- 🎮 **Game-first & Education-first**: Built specifically for game and education developers
- 🚀 **SDK-focused**: Developers don't deal with backend details - just use the SDK
- 🔒 **Self-hostable**: Run on your own infrastructure with Docker
- 📦 **Open-source**: MIT licensed, fully open source
- 🔑 **Dual Authentication**: API Key (for events) and JWT (for auth/projects)
- 📊 **Event Analytics**: Track and query events with metadata
- 🔄 **Mobile-Ready**: Automatic retry, token refresh, and network error handling
- ⚡ **High Performance**: O(1) API key lookup (Stripe/Supabase-level architecture)

## 🛠 Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + API Keys (bcrypt hashed)
- **Language**: TypeScript
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker** (v20 or higher) - [Download](https://www.docker.com/)
- **Docker Compose** (v2 or higher) - Usually included with Docker
- **Git** - [Download](https://git-scm.com/)

**Optional** (for local development without Docker):
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/)

## 🚀 Quick Start (One Command!)

**Get SkillBase running in under 2 minutes:**

```bash
# Clone the repository
git clone <repository-url>
cd Skillbase

# Start everything (PostgreSQL + API + Migrations + Tests)
npm run quick-start
```

That's it! SkillBase is now running at `http://localhost:3000`

### What Happens Automatically

- ✅ PostgreSQL database starts
- ✅ Database is created automatically
- ✅ Migrations run automatically
- ✅ SkillBase API starts
- ✅ SDK tests run (in development mode)
- ✅ API health check passes

### Verify Installation

```bash
# Check API health
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"skillbase-api"}
```

### Try the SDK

```bash
# Navigate to SDK directory
cd sdk

# Run SDK workflow tests
npm test
```

**📖 For detailed Quick Start guide, see [QUICK_START.md](./QUICK_START.md)**

## 📦 Manual Installation (Without Docker)

If you prefer to run SkillBase without Docker:

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
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

**⚠️ Important**: Change `JWT_SECRET` to a strong random string in production (minimum 32 characters).

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

## 🔧 Development Commands

```bash
# Development mode (with hot reload)
npm run start:dev

# Build for production
npm run build

# Production mode
npm run start:prod

# Run tests
npm run test

# Run workflow tests (SDK tests)
cd sdk && npm test

# Linting
npm run lint

# Docker commands
npm run docker:up      # Start containers
npm run docker:down    # Stop containers
npm run docker:logs    # View logs
npm run docker:restart # Restart containers
npm run docker:clean   # Remove containers and volumes
```

## 📚 API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- `POST /auth/login` - Login and get access token
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /auth/refresh` - Refresh JWT token
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Projects

- `GET /projects` - Get all projects (requires JWT)
- `POST /projects` - Create a new project (requires JWT)
- `GET /projects/:id` - Get a project by ID (requires JWT)
- `PUT /projects/:id` - Update a project (requires JWT)
- `DELETE /projects/:id` - Delete a project (requires JWT)
- `POST /projects/:id/regenerate-api-key` - Regenerate API key (requires JWT)

### Events

- `POST /v1/events` - Create a new event (requires API key)
  ```json
  {
    "userId": "user_123",
    "event": "level_completed",
    "value": 150,
    "meta": { "level": 5, "score": 1000 }
  }
  ```

- `GET /v1/events` - Get all events for the project (requires API key)
- `GET /v1/events?userId=<userId>` - Get events filtered by userId (requires API key)

### Health

- `GET /health` - Health check endpoint

## 📦 SDKs

SkillBase provides official SDKs for easy integration:

### JavaScript/TypeScript SDK

**Installation:**
```bash
npm install @skillbase/event-sdk
```

**Quick Start:**
```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';

// Initialize client
const client = new SkillBaseClient({
  baseUrl: 'http://localhost:3000',
});

// Register and login
const auth = await client.register('user@example.com', 'password123', 'John Doe');
client.setJwt(auth.accessToken);

// Create project and get API key
const project = await client.createProject('My Game');
client.setApiKey(project.apiKey);

// Track events
const event = await client.createEvent(
  auth.user.id,
  'level_completed',
  150,
  { level: 5, score: 1000 }
);

// Get events
const events = await client.getEvents(auth.user.id);
```

**Platforms Supported:**
- ✅ Node.js
- ✅ Browser
- ✅ React Native
- ✅ Expo

**Features:**
- 🔄 Automatic retry with exponential backoff
- 🔐 Automatic token refresh
- 📱 Mobile-ready error handling
- 📝 Full TypeScript support

For detailed SDK documentation, see [sdk/README.md](./sdk/README.md).

### Unity C# SDK

**Installation:**
1. Copy `sdk-unity/Runtime/SkillBase` folder to your Unity project's `Assets` folder
2. Or use Unity Package Manager with Git URL

**Quick Start:**
```csharp
using SkillBase;

// Initialize client
var client = SkillBaseClientWrapper.Instance;
client.Initialize(new SkillBaseClientOptions
{
    baseUrl = "http://localhost:3000",
    maxRetries = 3,
    retryDelayMs = 1000,
    autoRefreshToken = true
});

// Login
client.Login("user@example.com", "password123",
    (auth) => Debug.Log("Logged in"),
    (error) => Debug.LogError(error.Message)
);

// Track events
client.CreateEvent(userId, "level_completed", 150, metadata,
    (evt) => Debug.Log("Event tracked"),
    (error) => Debug.LogError(error.Message)
);
```

For detailed Unity SDK documentation, see [sdk-unity/README.md](./sdk-unity/README.md).

## 🔑 API Key Architecture

SkillBase uses a Stripe/Supabase-level API key architecture:

**Format:**
```
skb_<env>_<keyId>_<secret>
```

**Environments:**
- `live`: Production environment
- `test`: Testing/development environment

**Example:**
```
skb_live_482716ed5cb3ede4_6020414cd14db2644137b9dd14e72728b4019d5102e0a2cdb047602c1fcb79ff
```

**Performance:**
- ✅ **1 database query** (indexed lookup by keyId)
- ✅ **1 bcrypt compare** (secret validation)
- ✅ **Scales to millions** of projects
- ✅ **Stripe/Supabase-level** architecture

**Security:**
- 🔐 Secret is hashed (bcrypt, same as passwords)
- 🔐 keyId is indexed but not sensitive
- 🔐 Old keys are invalidated on regeneration
- 🔐 No plain text secrets in database

## 📁 Project Structure

```
Skillbase/
├── src/                    # Backend source code
│   ├── auth/              # Authentication module
│   ├── events/            # Event tracking module
│   ├── projects/          # Project management module
│   ├── users/             # User management module
│   ├── database/          # Database configuration & migrations
│   └── common/            # Shared utilities, guards, decorators
│
├── sdk/                    # JavaScript/TypeScript SDK
│   ├── src/               # SDK source code
│   ├── examples/          # Usage examples
│   └── tests/             # SDK tests
│
├── sdk-unity/             # Unity C# SDK
│   ├── Runtime/           # SDK runtime code
│   └── Examples/          # Unity examples
│
├── tests/                 # Integration tests
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker image definition
└── package.json           # Node.js dependencies
```

## 🧪 Testing

### Backend Tests

```bash
# Run unit tests
npm run test

# Run SDK workflow tests
cd sdk && npm test
```

### SDK Tests

The SDK includes comprehensive workflow tests:

- ✅ Auth Workflow (Register, Login, Refresh Token)
- ✅ Event API (Create Event, Get Events)
- ✅ Error Handling
- ✅ Token Persistence
- ✅ Retry Mechanism

See [tests/WORKFLOW_TEST_GUIDE.md](./tests/WORKFLOW_TEST_GUIDE.md) for detailed testing documentation.

## 🐳 Docker Usage

### Start Services

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# PostgreSQL only
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down
```

### Clean Everything (including volumes)

```bash
docker-compose down -v
```

### Rebuild After Code Changes

```bash
docker-compose build api
docker-compose up -d api
```

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### API Not Starting

```bash
# Check API logs
docker-compose logs api

# Rebuild API container
docker-compose build api
docker-compose up -d api
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

1. Change `PORT` in `.env` file
2. Update `docker-compose.yml` port mapping
3. Restart containers

## 📖 Additional Documentation

- [Docker Quick Start](./DOCKER_QUICKSTART.md) - Detailed Docker setup guide
- [SDK Documentation](./sdk/README.md) - Complete SDK reference
- [Unity SDK Documentation](./sdk-unity/README.md) - Unity integration guide
- [Mobile SDK Guide](./MOBILE_SDK_GUIDE.md) - Mobile development guide
- [Workflow Test Guide](./tests/WORKFLOW_TEST_GUIDE.md) - Testing documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript
- [PostgreSQL](https://www.postgresql.org/) - Advanced open-source database
