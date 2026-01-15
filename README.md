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

- **Docker** (v20 or higher) - [Download](https://www.docker.com/)
- **Docker Compose** (v2 or higher) - Usually included with Docker
- **Git** - [Download](https://git-scm.com/)

**That's it!** No need for Node.js or PostgreSQL installation - Docker handles everything.

## 🚀 Quick Start (One Command!)

**Get SkillBase running in under 2 minutes:**

```bash
# 1. Clone the repository
git clone <repository-url>
cd Skillbase

# 2. Start everything (PostgreSQL + API + Migrations + Tests)
npm run quick-start
```

**That's it!** SkillBase is now running at `http://localhost:3000`

### What Happens Automatically

When you run `npm run quick-start`:

- ✅ PostgreSQL database starts automatically
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

# Install SDK dependencies (first time only)
npm install

# Run SDK workflow tests
npm test
```

**📖 For detailed Quick Start guide, see [QUICK_START.md](./QUICK_START.md)**

## 📚 SDK Quick Examples

### JavaScript/TypeScript SDK

**Installation:**
```bash
npm install @skillbase/event-sdk
```

**Quick Example:**
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
await client.createEvent(
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

### Unity C# SDK

**Quick Example:**
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
var metadata = new Dictionary<string, object>
{
    { "level", 5 },
    { "score", 1000 }
};

client.CreateEvent(userId, "level_completed", 150, metadata,
    (evt) => Debug.Log("Event tracked"),
    (error) => Debug.LogError(error.Message)
);
```

**📖 For detailed SDK documentation:**
- [JavaScript/TypeScript SDK](./sdk/README.md)
- [Unity C# SDK](./sdk-unity/README.md)
- [Mobile SDK Guide](./MOBILE_SDK_GUIDE.md)

## 🔧 Quick Commands

```bash
# Start services
npm run quick-start

# View logs
npm run quick-start:logs

# Restart services
npm run quick-start:restart

# Stop services
npm run docker:down

# Clean everything (removes volumes)
npm run quick-start:clean
```

## 📖 API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get access token
- `POST /auth/refresh` - Refresh JWT token

### Projects

- `GET /projects` - Get all projects (requires JWT)
- `POST /projects` - Create a new project (requires JWT)
- `GET /projects/:id` - Get a project by ID (requires JWT)
- `POST /projects/:id/regenerate-api-key` - Regenerate API key (requires JWT)

### Events

- `POST /v1/events` - Create a new event (requires API key)
- `GET /v1/events` - Get all events for the project (requires API key)
- `GET /v1/events?userId=<userId>` - Get events filtered by userId (requires API key)

### Health

- `GET /health` - Health check endpoint

**Example API Call:**
```bash
# Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

## 🔑 API Key Architecture

SkillBase uses a Stripe/Supabase-level API key architecture:

**Format:**
```
skb_<env>_<keyId>_<secret>
```

**Environments:**
- `live`: Production environment
- `test`: Testing/development environment

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

## 🧪 Testing

```bash
# Run SDK workflow tests
cd sdk && npm test

# Run backend unit tests
npm run test
```

The SDK includes comprehensive workflow tests:
- ✅ Auth Workflow (Register, Login, Refresh Token)
- ✅ Event API (Create Event, Get Events)
- ✅ Error Handling
- ✅ Token Persistence
- ✅ Retry Mechanism

See [tests/WORKFLOW_TEST_GUIDE.md](./tests/WORKFLOW_TEST_GUIDE.md) for detailed testing documentation.

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Edit .env.docker and change PORT
PORT=3001

# Restart
npm run quick-start:restart
```

### Docker Not Running

```bash
# Check Docker status
docker ps

# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
```

### API Not Starting

```bash
# Check API logs
npm run quick-start:logs

# Rebuild and restart
npm run quick-start:restart
```

### Clean Start (Fresh Install)

```bash
# Stop and remove everything
npm run quick-start:clean

# Start fresh
npm run quick-start
```

**📖 For more troubleshooting, see [QUICK_START.md](./QUICK_START.md#-troubleshooting)**

## 📖 Additional Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Detailed Quick Start guide with troubleshooting
- **[MANUAL_INSTALL.md](./MANUAL_INSTALL.md)** - Manual installation without Docker
- **[SDK Documentation](./sdk/README.md)** - Complete JavaScript/TypeScript SDK reference
- **[Unity SDK Documentation](./sdk-unity/README.md)** - Unity C# SDK integration guide
- **[Mobile SDK Guide](./MOBILE_SDK_GUIDE.md)** - Mobile development guide
- **[Workflow Test Guide](./tests/WORKFLOW_TEST_GUIDE.md)** - Testing documentation

## 🚀 Advanced / Manual Installation

If you prefer to run SkillBase without Docker or need custom configuration:

**→ See [MANUAL_INSTALL.md](./MANUAL_INSTALL.md) for detailed manual installation instructions.**

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript
- [PostgreSQL](https://www.postgresql.org/) - Advanced open-source database
