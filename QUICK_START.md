# 🚀 SkillBase Quick Start Guide

**Get SkillBase running in under 2 minutes with a single command!**

## ⚡ One-Command Setup

```bash
# Clone the repository
git clone <repository-url>
cd Skillbase

# Start everything (PostgreSQL + API + Migrations + Tests)
npm run quick-start
```

That's it! SkillBase is now running at `http://localhost:3000`

## 📋 What Happens Automatically

When you run `npm run quick-start`, the script:

1. ✅ **Checks prerequisites** (Docker, Docker Compose)
2. ✅ **Creates `.env.docker`** if it doesn't exist
3. ✅ **Builds Docker images** (PostgreSQL + SkillBase API)
4. ✅ **Starts PostgreSQL** database
5. ✅ **Runs database migrations** automatically
6. ✅ **Starts SkillBase API**
7. ✅ **Runs SDK tests** (in development mode)
8. ✅ **Waits for API to be ready**

## 🎯 Verify Installation

```bash
# Check API health
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"skillbase-api"}
```

## 📚 Try the SDK

### JavaScript/TypeScript SDK

```bash
# Navigate to SDK directory
cd sdk

# Install SDK dependencies
npm install

# Run SDK workflow tests
npm test
```

### Unity SDK

See [sdk-unity/README.md](./sdk-unity/README.md) for Unity integration guide.

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

## 🐳 Manual Docker Commands

If you prefer using Docker Compose directly:

```bash
# Start services
docker-compose up -d

# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Clean everything
docker-compose down -v
```

## 📖 Next Steps

### 1. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Use the SDK

```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';

const client = new SkillBaseClient({
  baseUrl: 'http://localhost:3000',
});

// Register and login
const auth = await client.register('user@example.com', 'password123', 'John Doe');
client.setJwt(auth.accessToken);

// Create project
const project = await client.createProject('My Game');
client.setApiKey(project.apiKey);

// Track events
await client.createEvent(
  auth.user.id,
  'level_completed',
  150,
  { level: 5, score: 1000 }
);
```

### 3. Explore Examples

- **Full Workflow**: `sdk/examples/full-workflow.ts`
- **Mobile Ready**: `sdk/examples/mobile-ready.ts`
- **Error Handling**: `sdk/examples/error-handling.js`
- **Unity**: `sdk-unity/Examples/SkillBaseExample.cs`

## 🛠 Troubleshooting

### Port Already in Use

If port 3000 is already in use:

1. Edit `.env.docker` and change `PORT=3000` to another port (e.g., `PORT=3001`)
2. Restart: `npm run quick-start:restart`

### Docker Not Running

```bash
# Check Docker status
docker ps

# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### API Not Starting

```bash
# Check API logs
docker-compose logs api

# Rebuild and restart
docker-compose up --build -d api
```

### Clean Start (Fresh Install)

```bash
# Stop and remove everything
npm run quick-start:clean

# Start fresh
npm run quick-start
```

## 📝 Environment Configuration

The quick start uses `.env.docker` for configuration. To customize:

1. Edit `.env.docker`:
   ```env
   DB_PASSWORD=your-password
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

2. Restart services:
   ```bash
   npm run quick-start:restart
   ```

**⚠️ Production Note**: Change `JWT_SECRET` to a strong random string (min 32 chars) before deploying to production.

## 🎓 Learning Resources

- [Full Documentation](./README.md) - Complete SkillBase documentation
- [SDK Documentation](./sdk/README.md) - JavaScript/TypeScript SDK guide
- [Unity SDK](./sdk-unity/README.md) - Unity C# SDK guide
- [Mobile Guide](./MOBILE_SDK_GUIDE.md) - Mobile development guide
- [Test Guide](./tests/WORKFLOW_TEST_GUIDE.md) - Testing documentation

## ✅ Success Checklist

- [ ] Docker and Docker Compose installed
- [ ] `npm run quick-start` completed successfully
- [ ] Health check returns `{"status":"ok"}`
- [ ] SDK tests pass (`cd sdk && npm test`)
- [ ] Can register a user via API
- [ ] Can create events via SDK

## 🚀 You're Ready!

SkillBase is now running and ready to use. Start building your game or education application!

For questions or issues, check the [troubleshooting section](#-troubleshooting) or open an issue on GitHub.

