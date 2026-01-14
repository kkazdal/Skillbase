# SkillBase

**Game-first and education-first backend platform for developers**

SkillBase is a simple, fast, and open-source backend platform designed specifically for game and education developers. Unlike Firebase or Supabase's general-purpose approach, SkillBase offers a game-first and education-first experience.

## Features

- 🎮 **Game-first & Education-first**: Built specifically for game and education developers
- 🚀 **SDK-focused**: Developers don't deal with backend details
- 🔒 **Self-hostable**: Run on your own infrastructure
- 📦 **Open-source**: MIT licensed
- 🔑 **API Key Authentication**: Simple API key-based authentication
- 🔐 **JWT Authentication**: Token-based authentication for web apps

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + API Keys
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Skillbase
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=skillbase

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get access token

### Projects

- `GET /projects` - Get all projects (requires authentication)
- `POST /projects` - Create a new project (requires authentication)
- `GET /projects/:id` - Get a project by ID (requires authentication)
- `PUT /projects/:id` - Update a project (requires authentication)
- `DELETE /projects/:id` - Delete a project (requires authentication)

### Events

- `POST /v1/events` - Create a new event (requires API key)
- `GET /v1/events` - Get all events for the project (requires API key)
- `GET /v1/events?userId=<userId>` - Get events filtered by userId (requires API key)

## Project Structure

```
src/
├── app.module.ts
├── main.ts
│
├── config/
│   ├── database.config.ts
│   └── jwt.config.ts
│
├── common/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── api-key.guard.ts
│   ├── decorators/
│   │   └── request-context.decorator.ts
│   ├── interfaces/
│   │   └── request-context.interface.ts
│   └── utils/
│       └── generate-api-key.ts
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
│
├── users/
│   ├── user.entity.ts
│   ├── users.module.ts
│   └── users.service.ts
│
├── projects/
│   ├── project.entity.ts
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   └── projects.module.ts
│
└── database/
    ├── database.module.ts
    └── migrations/
```

## Development

```bash
# Development mode
npm run start:dev

# Build
npm run build

# Production mode
npm run start:prod

# Run tests
npm run test

# Linting
npm run lint
```

## API Key Architecture

### ⚡ O(1) Lookup - Stripe/Supabase Level

**API Key Format:**
```
skb_<env>_<keyId>_<secret>
```

**Supported Environments:**
- `live`: Production environment
- `test`: Testing/development environment

**Examples:**
```
# Production key
skb_live_8f3a1c9d_a9c2e0f4d1b3e5f7a9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7

# Test key
skb_test_8f3a1c9d_a9c2e0f4d1b3e5f7a9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7
```

**Architecture:**
- **keyId**: Short identifier (16 hex chars) - stored plain, indexed for O(1) lookup
- **secret**: Long secret part (64 hex chars) - hashed with bcrypt, never stored plain
- **fullKey**: Complete API key shown only once during creation/regeneration

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

### 🚀 Future Enhancements

1. **Redis Caching**
   - Cache frequently accessed API keys
   - TTL-based invalidation
   - Further reduce database load

2. **Rate Limiting**
   - Per-API-key rate limiting
   - Prevent abuse and DDoS

3. **Environment Support** ✅ (Implemented)
   - `skb_live_` for production
   - `skb_test_` for testing
   - Environment-based validation
   - Easy to extend with more environments

See `src/projects/projects.service.ts` → `validateApiKey()` method for implementation details.

## SDK

SkillBase provides an official JavaScript/TypeScript SDK for easy integration.

### Installation

```bash
npm install @skillbase/event-sdk
```

### Quick Start

```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';

const client = new SkillBaseClient({
  apiKey: 'skb_live_your_api_key_here',
  baseUrl: 'http://localhost:3000/v1',
});

// Create an event
const event = await client.createEvent(
  'user_123',
  'level_completed',
  150,
  { level: 5, score: 1000 }
);

// Get events
const events = await client.getEvents('user_123');
```

For detailed SDK documentation, see [sdk/README.md](./sdk/README.md).

## License

MIT

