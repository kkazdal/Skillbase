# SkillBase Event SDK

JavaScript/TypeScript SDK for interacting with the SkillBase Event API. Works in both Node.js and browser environments.

## Installation

```bash
npm install @skillbase/event-sdk
```

Or with yarn:

```bash
yarn add @skillbase/event-sdk
```

## Quick Start

```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';

// Initialize the client
const client = new SkillBaseClient({
  apiKey: 'skb_live_your_api_key_here',
  baseUrl: 'http://localhost:3000/v1', // Optional
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

## API Reference

### `SkillBaseClient`

Main client class for interacting with the SkillBase Event API.

#### Constructor

```typescript
new SkillBaseClient(options: SkillBaseClientOptions)
```

**Options:**
- `apiKey` (string, required): Your SkillBase API key
- `baseUrl` (string, optional): Base URL for the API. Defaults to `http://localhost:3000/v1`

**Example:**
```typescript
const client = new SkillBaseClient({
  apiKey: 'skb_live_482716ed5cb3ede4_6020414cd14db2644137b9dd14e72728b4019d5102e0a2cdb047602c1fcb79ff',
  baseUrl: 'https://api.skillbase.com/v1', // Production URL
});
```

#### Methods

##### `createEvent(userId, name, value?, metadata?)`

Creates a new event.

**Parameters:**
- `userId` (string, required): User ID associated with the event
- `name` (string, required): Event name/type (e.g., "level_completed", "purchase", "signup")
- `value` (number, optional): Numeric value associated with the event
- `metadata` (object, optional): Additional metadata as a JSON object

**Returns:** `Promise<Event>`

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
console.log('Created at:', event.createdAt);
```

##### `getEvents(userId?)`

Retrieves events, optionally filtered by userId.

**Parameters:**
- `userId` (string, optional): Filter events by user ID. If omitted, returns all events for the project.

**Returns:** `Promise<Event[]>`

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
      console.error('Invalid API key');
    } else if (error.statusCode === 400) {
      console.error('Invalid request:', error.response);
    } else if (error.statusCode === 0) {
      console.error('Network error');
    }
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Common Error Codes

- `401`: Invalid or missing API key
- `400`: Invalid request (missing required fields, validation errors)
- `0`: Network error (connection failed, timeout, etc.)

## Examples

### Node.js Example

```typescript
import { SkillBaseClient } from '@skillbase/event-sdk';

async function main() {
  const client = new SkillBaseClient({
    apiKey: process.env.SKILLBASE_API_KEY!,
    baseUrl: 'http://localhost:3000/v1',
  });

  // Track a game event
  await client.createEvent(
    'user_123',
    'level_completed',
    150,
    { level: 5, score: 1000 }
  );

  // Get user's events
  const events = await client.getEvents('user_123');
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
  baseUrl: 'https://api.skillbase.com/v1',
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

### Error Handling with Retry

```typescript
async function createEventWithRetry(
  userId: string,
  name: string,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.createEvent(userId, name);
    } catch (error) {
      if (error instanceof SkillBaseError && error.statusCode === 0) {
        // Network error - retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
      throw error;
    }
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

1. Register a user account via `/auth/register`
2. Login via `/auth/login` to get a JWT token
3. Create a project via `POST /projects` with the JWT token
4. The API key is returned in the response

See the [main README](../README.md) for more details.

## Browser Support

The SDK uses the native `fetch` API, which is supported in:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Node.js 18+ (native fetch)
- For older Node.js versions, you may need a polyfill like `node-fetch`

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions. No additional `@types` package is needed.

```typescript
import { SkillBaseClient, Event, SkillBaseError } from '@skillbase/event-sdk';

const client: SkillBaseClient = new SkillBaseClient({
  apiKey: 'skb_live_...',
});

const events: Event[] = await client.getEvents();
```

## License

MIT

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/kkazdal/Skillbase).

