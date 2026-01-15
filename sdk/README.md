# SkillBase Full SDK

Complete JavaScript/TypeScript SDK for interacting with the SkillBase API. Supports **Auth**, **Project**, and **Event** APIs. Works in Node.js, browsers, and mobile apps.

## Features

- 🔐 **Authentication**: Register, login, logout, and JWT token refresh
- 📦 **Project Management**: Create, list, and manage projects with API keys
- 📊 **Event Tracking**: Create and retrieve events with metadata
- 🔑 **Dual Auth Support**: Use API keys or JWT tokens
- 📝 **Full TypeScript Support**: Complete type definitions included
- 🌐 **Universal**: Works in Node.js, browsers, React Native, and Unity
- 🔄 **Mobile-Ready**: Automatic retry, token refresh, and network error handling
- ⚡ **Retry Mechanism**: Exponential backoff for failed requests
- 🔒 **Token Management**: Automatic token refresh and persistence callbacks

## Installation

```bash
npm install @skillbase/event-sdk
```

Or with yarn:

```bash
yarn add @skillbase/event-sdk
```

## Quick Start

### Complete Workflow

```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';

// Initialize client
const client = new SkillBaseClient({
  baseUrl: 'http://localhost:3000',
});

// 1. Register user
const auth = await client.register('user@example.com', 'password123', 'John Doe');
client.setJwt(auth.accessToken);

// 2. Create project (get API key)
const project = await client.createProject('My Game');
client.setApiKey(project.apiKey);

// 3. Track events
const event = await client.createEvent(
  auth.user.id,
  'level_completed',
  150,
  { level: 5, score: 1000 }
);

// 4. List events
const events = await client.getEvents(auth.user.id);
```

### Using API Key (Event API Only)

```typescript
const client = new SkillBaseClient({
  apiKey: 'skb_live_your_api_key_here',
  baseUrl: 'http://localhost:3000',
});

// Track events
const event = await client.createEvent('user_123', 'level_completed', 150);
const events = await client.getEvents('user_123');
```

### Using JWT (Auth & Project APIs)

```typescript
const client = new SkillBaseClient({
  jwt: 'your_jwt_token_here',
  baseUrl: 'http://localhost:3000',
});

// Create project
const project = await client.createProject('My Game');
const projects = await client.listProjects();
```

## API Reference

### `SkillBaseClient`

Main client class for interacting with all SkillBase APIs.

#### Constructor

```typescript
new SkillBaseClient(options: SkillBaseClientOptions)
```

**Options:**
- `apiKey` (string, optional): API key for Event API (project-specific)
- `jwt` (string, optional): JWT token for Auth and Project APIs (user-specific)
- `baseUrl` (string, optional): Base URL for the API. Defaults to `http://localhost:3000`
- `maxRetries` (number, optional): Maximum retry attempts (default: 3)
- `retryDelay` (number, optional): Retry delay in milliseconds (default: 1000)
- `autoRefreshToken` (boolean, optional): Enable automatic token refresh on 401 (default: true)
- `onTokenRefresh` (function, optional): Callback when token is refreshed

**Note:** Either `apiKey` or `jwt` must be provided (or both). For register/login, neither is required initially.

**Example:**
```typescript
// With API key
const client = new SkillBaseClient({
  apiKey: 'skb_live_482716ed5cb3ede4_6020414cd14db2644137b9dd14e72728b4019d5102e0a2cdb047602c1fcb79ff',
  baseUrl: 'https://api.skillbase.com',
});

// With JWT
const client = new SkillBaseClient({
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  baseUrl: 'https://api.skillbase.com',
});
```

#### Methods

##### Auth Methods

###### `register(email, password, name?)`

Registers a new user.

**Parameters:**
- `email` (string, required): User email address
- `password` (string, required): User password (min 6 characters)
- `name` (string, optional): User name

**Returns:** `Promise<AuthResponse>`

**Example:**
```typescript
const auth = await client.register('user@example.com', 'password123', 'John Doe');
console.log('User ID:', auth.user.id);
console.log('JWT:', auth.accessToken);
client.setJwt(auth.accessToken); // Set JWT for subsequent requests
```

###### `login(email, password)`

Logs in a user.

**Parameters:**
- `email` (string, required): User email address
- `password` (string, required): User password

**Returns:** `Promise<AuthResponse>`

**Note:** JWT is automatically set after successful login.

**Example:**
```typescript
const auth = await client.login('user@example.com', 'password123');
// JWT is automatically set
```

###### `refreshToken()`

Refreshes the current JWT token. Mobile-friendly: Allows apps to refresh tokens before expiration.

**Returns:** `Promise<AuthResponse>`

**Example:**
```typescript
try {
  const auth = await client.refreshToken();
  console.log('Token refreshed:', auth.accessToken);
} catch (error) {
  // Token expired or invalid, need to login again
  await client.login(email, password);
}
```

###### `logout()`

Clears the JWT token (local logout).

**Example:**
```typescript
client.logout();
```

##### Project Methods

###### `createProject(name, description?)`

Creates a new project.

**Parameters:**
- `name` (string, required): Project name
- `description` (string, optional): Project description

**Returns:** `Promise<CreateProjectResponse>`

**Requires:** JWT token

**Note:** API key is automatically set after project creation.

**Example:**
```typescript
const result = await client.createProject('My Game', 'A fun game project');
console.log('Project ID:', result.project.id);
console.log('API Key:', result.apiKey);
// API key is automatically set
```

###### `listProjects()`

Lists all projects for the current user.

**Returns:** `Promise<Project[]>`

**Requires:** JWT token

**Example:**
```typescript
const projects = await client.listProjects();
console.log(`You have ${projects.length} projects`);
```

###### `getProject(id)`

Gets a project by ID.

**Parameters:**
- `id` (string, required): Project ID

**Returns:** `Promise<Project>`

**Requires:** JWT token

**Example:**
```typescript
const project = await client.getProject('project-id-here');
console.log(project.name);
```

###### `regenerateApiKey(projectId)`

Regenerates the API key for a project.

**Parameters:**
- `projectId` (string, required): Project ID

**Returns:** `Promise<{ apiKey: string }>`

**Requires:** JWT token

**Note:** New API key is automatically set after regeneration.

**Example:**
```typescript
const { apiKey } = await client.regenerateApiKey('project-id-here');
console.log('New API key:', apiKey);
// New API key is automatically set
```

##### Event Methods

###### `createEvent(userId, name, value?, metadata?)`

Creates a new event.

**Parameters:**
- `userId` (string, required): User ID associated with the event
- `name` (string, required): Event name/type (e.g., "level_completed", "purchase")
- `value` (number, optional): Numeric value associated with the event
- `metadata` (object, optional): Additional metadata as a JSON object

**Returns:** `Promise<Event>`

**Requires:** API key or JWT token

**Example:**
```typescript
const event = await client.createEvent(
  'user_123',
  'level_completed',
  150,
  {
    level: 5,
    score: 1000,
    difficulty: 'hard',
    timeSpent: 120,
  }
);

console.log('Event created:', event.id);
```

###### `getEvents(userId?)`

Retrieves events, optionally filtered by userId.

**Parameters:**
- `userId` (string, optional): Filter events by user ID. If omitted, returns all events for the project.

**Returns:** `Promise<Event[]>`

**Requires:** API key or JWT token

**Example:**
```typescript
// Get all events for the project
const allEvents = await client.getEvents();

// Get events for a specific user
const userEvents = await client.getEvents('user_123');

userEvents.forEach(event => {
  console.log(`${event.name}: ${event.value} at ${event.createdAt}`);
});
```

##### Utility Methods

###### `setJwt(jwt)`

Sets the JWT token manually.

**Parameters:**
- `jwt` (string, required): JWT token

**Example:**
```typescript
client.setJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
```

###### `setApiKey(apiKey)`

Sets the API key manually.

**Parameters:**
- `apiKey` (string, required): API key

**Example:**
```typescript
client.setApiKey('skb_live_xxx_yyy');
```

## Types

### `Event`

```typescript
interface Event {
  id: string;                    // Unique event identifier (UUID)
  projectId: string;             // Project ID that owns this event
  userId?: string | null;         // User ID associated with the event
  name: string;                   // Event name/type
  value?: number | null;          // Numeric value associated with the event
  metadata?: Record<string, any> | null;  // Additional metadata
  createdAt: string;             // Event creation timestamp (ISO 8601)
}
```

### `Project`

```typescript
interface Project {
  id: string;                    // Unique project identifier (UUID)
  name: string;                   // Project name
  apiKey?: string;                // API key (only returned on creation/regeneration)
  environment: 'live' | 'test';   // Project environment
  userId: string;                 // User ID that owns this project
  createdAt: string;              // Project creation timestamp (ISO 8601)
}
```

### `User`

```typescript
interface User {
  id: string;                     // Unique user identifier (UUID)
  email: string;                  // User email address
  name?: string | null;            // User name
  createdAt: string;              // User creation timestamp (ISO 8601)
}
```

### `AuthResponse`

```typescript
interface AuthResponse {
  user: User;                      // User object
  accessToken: string;            // JWT access token
}
```

### `CreateProjectResponse`

```typescript
interface CreateProjectResponse {
  project: Project;                // Created project object
  apiKey: string;                 // API key (only shown once during creation)
}
```

### `SkillBaseError`

Custom error class thrown by the SDK.

```typescript
class SkillBaseError extends Error {
  message: string;
  statusCode?: number;    // HTTP status code (0 for network errors)
  response?: any;         // API response body
}
```

## Error Handling

The SDK throws `SkillBaseError` for API errors. Always wrap API calls in try-catch blocks.

```typescript
import { SkillBaseClient, SkillBaseError } from '@skillbase/event-sdk';

const client = new SkillBaseClient({
  apiKey: 'skb_live_your_api_key_here',
});

try {
  const event = await client.createEvent('user_123', 'test_event');
  console.log('Success:', event);
} catch (error) {
  if (error instanceof SkillBaseError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    
    if (error.statusCode === 401) {
      console.error('Authentication failed. Check your API key or JWT.');
    } else if (error.statusCode === 400) {
      console.error('Invalid request:', error.response);
    } else if (error.statusCode === 0) {
      console.error('Network error. Check your connection.');
    }
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Common Error Codes

- `401`: Invalid or missing API key/JWT
- `400`: Invalid request (missing required fields, validation errors)
- `0`: Network error (connection failed, timeout, etc.)

## Examples

### Complete Workflow

See [examples/full-workflow.ts](./examples/full-workflow.ts) for a complete example showing:
- User registration
- Login
- Project creation
- Event tracking
- Event listing
- API key regeneration

### API Key Usage

See [examples/api-key-usage.ts](./examples/api-key-usage.ts) for Event API usage with API key.

### JWT Usage

See [examples/jwt-usage.ts](./examples/jwt-usage.ts) for Auth and Project API usage with JWT.

### Node.js Example

```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';

async function main() {
  const client = new SkillBaseClient({
    baseUrl: process.env.SKILLBASE_BASE_URL || 'http://localhost:3000',
  });

  // Register and login
  const auth = await client.register(
    process.env.USER_EMAIL!,
    process.env.USER_PASSWORD!,
  );
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

  // List events
  const events = await client.getEvents(auth.user.id);
  console.log(`User has ${events.length} events`);
}

main().catch(console.error);
```

### Browser Example

```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';

// Initialize client
const client = new SkillBaseClient({
  apiKey: 'skb_live_your_api_key_here',
  baseUrl: 'https://api.skillbase.com',
});

// Track event when user completes a level
async function onLevelComplete(level: number, score: number) {
  try {
    await client.createEvent(
      getCurrentUserId(),
      'level_completed',
      score,
      { level, timestamp: Date.now() }
    );
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Load user progress
async function loadProgress() {
  try {
    const events = await client.getEvents(getCurrentUserId());
    const completedLevels = events.filter(e => e.name === 'level_completed');
    console.log(`Completed ${completedLevels.length} levels`);
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
}
```

## API Key Format

SkillBase API keys follow this format:

```
skb_<env>_<keyId>_<secret>
```

- `env`: Environment (`live` or `test`)
- `keyId`: 16-character hex identifier
- `secret`: 64-character hex secret

**Example:**
```
skb_live_482716ed5cb3ede4_6020414cd14db2644137b9dd14e72728b4019d5102e0a2cdb047602c1fcb79ff
```

## Getting Your API Key

1. Register a user account via `client.register()`
2. Login via `client.login()` to get a JWT token
3. Create a project via `client.createProject()` with the JWT token
4. The API key is returned in the response

## Browser Support

The SDK uses the native `fetch` API, which is supported in:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Node.js 18+ (native fetch)
- For older Node.js versions, you may need a polyfill like `node-fetch`

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions. No additional `@types` package is needed.

```typescript
import { SkillBaseClient, Event, Project, SkillBaseError } from '@skillbase/event-sdk';

const client: SkillBaseClient = new SkillBaseClient({
  apiKey: 'skb_live_...',
});

const events: Event[] = await client.getEvents();
const projects: Project[] = await client.listProjects();
```

## License

MIT

## Mobile Examples

### React Native Example

```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize with mobile-ready options
const client = new SkillBaseClient({
  baseUrl: 'https://api.skillbase.com',
  maxRetries: 3,
  retryDelay: 1000,
  autoRefreshToken: true,
  onTokenRefresh: async (token) => {
    await AsyncStorage.setItem('jwt_token', token);
  }
});

// Load saved token
const savedToken = await AsyncStorage.getItem('jwt_token');
if (savedToken) client.setJwt(savedToken);

// Login
await client.login('user@example.com', 'password123');

// Track event (with automatic retry)
await client.createEvent(
  userId,
  'level_completed',
  150,
  { level: 5, score: 1000 }
);
```

### Unity Example

```csharp
using SkillBase;

// Initialize
var client = SkillBaseClientWrapper.Instance;
client.Initialize(new SkillBaseClientOptions
{
    baseUrl = "https://api.skillbase.com",
    maxRetries = 3,
    retryDelayMs = 1000,
    autoRefreshToken = true,
    onTokenRefresh = (token) => PlayerPrefs.SetString("jwt_token", token)
});

// Login
client.Login("user@example.com", "password123",
    (auth) => Debug.Log("Logged in"),
    (error) => Debug.LogError(error.Message)
);

// Track event
client.CreateEvent(userId, "level_completed", 150, metadata,
    (evt) => Debug.Log("Event tracked"),
    (error) => Debug.LogError(error.Message)
);
```

See [mobile-ready.ts](./examples/mobile-ready.ts) and [Unity SDK](../sdk-unity/README.md) for more examples.

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/kkazdal/Skillbase).
