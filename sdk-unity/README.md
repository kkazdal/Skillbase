# SkillBase Unity SDK

Unity C# SDK for SkillBase backend platform. Mobile-ready with automatic retry and token refresh.

## Installation

1. Copy the `Runtime/SkillBase` folder to your Unity project's `Assets` folder
2. Or use Unity Package Manager with Git URL: `https://github.com/kkazdal/Skillbase.git?path=sdk-unity`

## Quick Start

### Basic Setup

```csharp
using SkillBase;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    private SkillBaseClientWrapper clientWrapper;

    void Start()
    {
        // Initialize client
        clientWrapper = SkillBaseClientWrapper.Instance;
        clientWrapper.Initialize(new SkillBaseClientOptions
        {
            baseUrl = "https://api.skillbase.com",
            maxRetries = 3,
            retryDelayMs = 1000,
            autoRefreshToken = true,
            onTokenRefresh = (newToken) =>
            {
                // Save token to PlayerPrefs or secure storage
                PlayerPrefs.SetString("jwt_token", newToken);
                PlayerPrefs.Save();
            }
        });

        // Load saved token if exists
        string savedToken = PlayerPrefs.GetString("jwt_token", "");
        if (!string.IsNullOrEmpty(savedToken))
        {
            clientWrapper.Client.SetJwt(savedToken);
        }
    }
}
```

### Authentication

```csharp
// Register user
clientWrapper.Register(
    "user@example.com",
    "password123",
    "Player Name",
    (authResponse) =>
    {
        Debug.Log($"User registered: {authResponse.user.id}");
        // Token is automatically saved via onTokenRefresh callback
    },
    (error) =>
    {
        Debug.LogError($"Registration failed: {error.Message}");
    }
);

// Login
clientWrapper.Login(
    "user@example.com",
    "password123",
    (authResponse) =>
    {
        Debug.Log($"Logged in: {authResponse.user.id}");
    },
    (error) =>
    {
        Debug.LogError($"Login failed: {error.Message}");
    }
);

// Refresh token (manual)
clientWrapper.RefreshToken(
    (authResponse) =>
    {
        Debug.Log("Token refreshed");
    },
    (error) =>
    {
        Debug.LogError($"Token refresh failed: {error.Message}");
        // Token expired, need to login again
    }
);
```

### Event Tracking

```csharp
// Create event
var metadata = new Dictionary<string, object>
{
    { "level", 5 },
    { "score", 1000 },
    { "difficulty", "hard" }
};

clientWrapper.CreateEvent(
    userId: "user_123",
    name: "level_completed",
    value: 150.0,
    metadata: metadata,
    onSuccess: (evt) =>
    {
        Debug.Log($"Event created: {evt.id}");
    },
    onError: (error) =>
    {
        Debug.LogError($"Failed to create event: {error.Message}");
    }
);

// Get events
clientWrapper.GetEvents(
    userId: "user_123",
    onSuccess: (events) =>
    {
        Debug.Log($"Found {events.Length} events");
        foreach (var evt in events)
        {
            Debug.Log($"{evt.name}: {evt.value} at {evt.createdAt}");
        }
    },
    onError: (error) =>
    {
        Debug.LogError($"Failed to get events: {error.Message}");
    }
);
```

## Mobile-Ready Features

### Automatic Retry

The SDK automatically retries failed requests with exponential backoff:

```csharp
var options = new SkillBaseClientOptions
{
    maxRetries = 3,        // Retry up to 3 times
    retryDelayMs = 1000,   // Start with 1 second delay
    // Delay increases: 1s, 2s, 4s
};
```

### Token Refresh

Automatic token refresh on 401 errors:

```csharp
var options = new SkillBaseClientOptions
{
    autoRefreshToken = true,
    onTokenRefresh = (newToken) =>
    {
        // Save to secure storage
        PlayerPrefs.SetString("jwt_token", newToken);
    }
};
```

### Error Handling

```csharp
clientWrapper.CreateEvent(
    userId,
    eventName,
    value,
    metadata,
    onSuccess: (evt) => { /* success */ },
    onError: (error) =>
    {
        switch (error.StatusCode)
        {
            case 401:
                // Unauthorized - token expired
                Debug.Log("Token expired, refreshing...");
                clientWrapper.RefreshToken(
                    (auth) => { /* retry operation */ },
                    (refreshError) => { /* login again */ }
                );
                break;
            case 400:
                // Bad request
                Debug.LogError($"Invalid request: {error.Message}");
                break;
            case null:
            case 0:
                // Network error
                Debug.LogError("Network error - check connection");
                break;
            default:
                Debug.LogError($"API error: {error.Message}");
                break;
        }
    }
);
```

## Complete Example

```csharp
using SkillBase;
using UnityEngine;
using System.Collections.Generic;

public class SkillBaseExample : MonoBehaviour
{
    private SkillBaseClientWrapper client;

    void Start()
    {
        // Initialize
        client = SkillBaseClientWrapper.Instance;
        client.Initialize(new SkillBaseClientOptions
        {
            baseUrl = "https://api.skillbase.com",
            maxRetries = 3,
            retryDelayMs = 1000,
            autoRefreshToken = true,
            onTokenRefresh = SaveToken
        });

        // Load saved token
        LoadToken();

        // Example: Track level completion
        TrackLevelCompletion(5, 1000);
    }

    void SaveToken(string token)
    {
        PlayerPrefs.SetString("jwt_token", token);
        PlayerPrefs.Save();
    }

    void LoadToken()
    {
        string token = PlayerPrefs.GetString("jwt_token", "");
        if (!string.IsNullOrEmpty(token))
        {
            client.Client.SetJwt(token);
        }
    }

    void TrackLevelCompletion(int level, int score)
    {
        var metadata = new Dictionary<string, object>
        {
            { "level", level },
            { "score", score },
            { "timestamp", System.DateTime.UtcNow.ToString("o") }
        };

        string userId = SystemInfo.deviceUniqueIdentifier; // Or your user ID

        client.CreateEvent(
            userId,
            "level_completed",
            score,
            metadata,
            (evt) =>
            {
                Debug.Log($"✅ Level {level} completion tracked: {evt.id}");
            },
            (error) =>
            {
                Debug.LogError($"❌ Failed to track event: {error.Message}");
                // Handle error (retry, show message, etc.)
            }
        );
    }
}
```

## API Reference

### SkillBaseClientOptions

- `apiKey` (string): API key for Event API
- `jwt` (string): JWT token for Auth API
- `baseUrl` (string): Base URL (default: "http://localhost:3000")
- `maxRetries` (int): Max retry attempts (default: 3)
- `retryDelayMs` (int): Retry delay in milliseconds (default: 1000)
- `autoRefreshToken` (bool): Enable auto token refresh (default: true)
- `onTokenRefresh` (Action<string>): Callback when token is refreshed

### Methods

#### Auth
- `Register(email, password, name, onSuccess, onError)`
- `Login(email, password, onSuccess, onError)`
- `RefreshToken(onSuccess, onError)`
- `Logout()`

#### Events
- `CreateEvent(userId, name, value, metadata, onSuccess, onError)`
- `GetEvents(userId, onSuccess, onError)`

## Requirements

- Unity 2020.3 or later
- .NET Standard 2.1 or later

## License

MIT

