# SkillBase Mobile SDK Guide

Complete guide for using SkillBase SDK in mobile applications (React Native, Unity, Flutter).

## Overview

SkillBase SDK is now **mobile-ready** with:
- ✅ Automatic retry with exponential backoff
- ✅ Token refresh handling
- ✅ Network error recovery
- ✅ Token persistence callbacks
- ✅ Unity C# SDK support

## Quick Start

### JavaScript/TypeScript (React Native, Expo)

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
const auth = await client.login('user@example.com', 'password123');

// Track events (automatic retry on network errors)
await client.createEvent(auth.user.id, 'level_completed', 150, {
  level: 5,
  score: 1000
});
```

### Unity C#

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

// Load saved token
string savedToken = PlayerPrefs.GetString("jwt_token", "");
if (!string.IsNullOrEmpty(savedToken))
{
    client.Client.SetJwt(savedToken);
}

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

## Mobile-Ready Features

### 1. Automatic Retry

SDK automatically retries failed requests with exponential backoff:

```typescript
const client = new SkillBaseClient({
  maxRetries: 3,      // Retry up to 3 times
  retryDelay: 1000,   // Start with 1 second delay
  // Retry delays: 1s, 2s, 4s (exponential)
});
```

**Retry Conditions:**
- Network errors (statusCode 0)
- 5xx server errors (500, 502, 503)
- 401 errors (with token refresh)

### 2. Token Refresh

Automatic token refresh on 401 errors:

```typescript
const client = new SkillBaseClient({
  autoRefreshToken: true,
  onTokenRefresh: async (newToken) => {
    // Save to secure storage
    await SecureStorage.setItem('jwt_token', newToken);
  }
});
```

**Manual Refresh:**
```typescript
try {
  const auth = await client.refreshToken();
  console.log('Token refreshed');
} catch (error) {
  // Token expired, need to login again
  await client.login(email, password);
}
```

### 3. Error Handling

```typescript
try {
  await client.createEvent(userId, 'test_event');
} catch (error) {
  if (error instanceof SkillBaseError) {
    switch (error.statusCode) {
      case 401:
        // Token expired - SDK auto-refreshes if enabled
        break;
      case 400:
        // Bad request - don't retry
        break;
      case 0:
        // Network error - SDK retries automatically
        break;
      case 500:
      case 502:
      case 503:
        // Server error - SDK retries automatically
        break;
    }
  }
}
```

## Workflows

### Authentication Workflow

```typescript
// 1. Register or Login
const auth = await client.register('user@example.com', 'password123', 'Name');
// or
const auth = await client.login('user@example.com', 'password123');

// 2. Token is automatically saved via onTokenRefresh callback

// 3. On app restart, load saved token
const savedToken = await AsyncStorage.getItem('jwt_token');
if (savedToken) {
  client.setJwt(savedToken);
  
  // Verify token is still valid
  try {
    await client.refreshToken();
  } catch (error) {
    // Token expired, need to login again
    await client.login(email, password);
  }
}
```

### Event Tracking Workflow

```typescript
// Track event with automatic retry
await client.createEvent(
  userId,
  'level_completed',
  150,
  {
    level: 5,
    score: 1000,
    timestamp: Date.now()
  }
);

// Get events with retry
const events = await client.getEvents(userId);
```

## Unity SDK

### Installation

1. Copy `sdk-unity/Runtime/SkillBase` to your Unity project's `Assets` folder
2. Or use Unity Package Manager with Git URL

### Complete Example

See [sdk-unity/README.md](../sdk-unity/README.md) for complete Unity integration guide and examples.

### Key Features

- **Coroutine-based**: Uses Unity coroutines for async operations
- **MonoBehaviour wrapper**: `SkillBaseClientWrapper` handles coroutines automatically
- **Error handling**: Callbacks for success/error
- **Token persistence**: Via `onTokenRefresh` callback

## Platform-Specific Notes

### React Native

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = new SkillBaseClient({
  onTokenRefresh: async (token) => {
    await AsyncStorage.setItem('jwt_token', token);
  }
});
```

### Expo

```typescript
import * as SecureStore from 'expo-secure-store';

const client = new SkillBaseClient({
  onTokenRefresh: async (token) => {
    await SecureStore.setItemAsync('jwt_token', token);
  }
});
```

### Unity

```csharp
// Use PlayerPrefs for development, secure storage for production
client.Initialize(new SkillBaseClientOptions
{
    onTokenRefresh = (token) => PlayerPrefs.SetString("jwt_token", token)
});
```

## Best Practices

1. **Initialize once**: Use singleton pattern
2. **Save tokens**: Always use `onTokenRefresh` callback
3. **Handle errors**: Provide error callbacks
4. **Offline queue**: Implement event queue for offline scenarios
5. **User ID**: Use consistent user ID (device ID, account ID)

## Testing

Test mobile scenarios:

1. **Network errors**: Disable network, verify retry
2. **Token expiration**: Wait for expiration, verify refresh
3. **Server errors**: Use invalid URL, verify retry
4. **Offline mode**: Queue events offline, verify send when online

## Examples

- **JavaScript/TypeScript**: `sdk/examples/mobile-ready.ts`
- **Unity**: See [sdk-unity/README.md](../sdk-unity/README.md) for Unity examples
- **Complete workflow**: `sdk/examples/full-workflow.ts`

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/kkazdal/Skillbase).

