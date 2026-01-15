# Unity SDK - Complete Workflow Guide

## Overview

This guide shows how to integrate SkillBase SDK into your Unity game with mobile-ready features.

## Setup

### 1. Import SDK

Copy `Runtime/SkillBase` folder to your Unity project's `Assets` folder.

### 2. Initialize Client

```csharp
using SkillBase;
using UnityEngine;

public class SkillBaseManager : MonoBehaviour
{
    private SkillBaseClientWrapper client;

    void Start()
    {
        // Initialize with mobile-ready options
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
}
```

## Authentication Workflow

### Register User

```csharp
void RegisterUser(string email, string password, string name)
{
    client.Register(
        email,
        password,
        name,
        (authResponse) =>
        {
            Debug.Log($"✅ Registered: {authResponse.user.id}");
            // Token is automatically saved via onTokenRefresh callback
        },
        (error) =>
        {
            Debug.LogError($"❌ Registration failed: {error.Message}");
            if (error.StatusCode == 409)
            {
                // User exists, try login
                LoginUser(email, password);
            }
        }
    );
}
```

### Login

```csharp
void LoginUser(string email, string password)
{
    client.Login(
        email,
        password,
        (authResponse) =>
        {
            Debug.Log($"✅ Logged in: {authResponse.user.id}");
            // Token is automatically saved
        },
        (error) =>
        {
            Debug.LogError($"❌ Login failed: {error.Message}");
            // Show login UI
        }
    );
}
```

### Token Refresh

```csharp
void RefreshTokenIfNeeded()
{
    client.RefreshToken(
        (authResponse) =>
        {
            Debug.Log("✅ Token refreshed");
        },
        (error) =>
        {
            Debug.LogError("❌ Token refresh failed");
            // Token expired, need to login again
            PlayerPrefs.DeleteKey("jwt_token");
            ShowLoginUI();
        }
    );
}
```

## Event Tracking Workflow

### Track Level Completion

```csharp
void TrackLevelCompletion(int level, int score)
{
    string userId = GetUserId(); // Your user ID

    var metadata = new Dictionary<string, object>
    {
        { "level", level },
        { "score", score },
        { "timestamp", System.DateTime.UtcNow.ToString("o") },
        { "device", SystemInfo.deviceModel },
        { "platform", Application.platform.ToString() }
    };

    client.CreateEvent(
        userId,
        "level_completed",
        score,
        metadata,
        (evt) =>
        {
            Debug.Log($"✅ Event tracked: {evt.id}");
        },
        (error) =>
        {
            Debug.LogError($"❌ Failed to track: {error.Message}");
            HandleEventError(error);
        }
    );
}
```

### Track Purchase

```csharp
void TrackPurchase(string itemId, double price)
{
    string userId = GetUserId();

    var metadata = new Dictionary<string, object>
    {
        { "item_id", itemId },
        { "currency", "USD" },
        { "timestamp", System.DateTime.UtcNow.ToString("o") }
    };

    client.CreateEvent(
        userId,
        "purchase",
        price,
        metadata,
        (evt) => Debug.Log($"✅ Purchase tracked: {evt.id}"),
        (error) => HandleEventError(error)
    );
}
```

### Load User Progress

```csharp
void LoadUserProgress()
{
    string userId = GetUserId();

    client.GetEvents(
        userId,
        (events) =>
        {
            Debug.Log($"✅ Loaded {events.Length} events");

            // Process events
            int levelCompletions = 0;
            int totalScore = 0;

            foreach (var evt in events)
            {
                if (evt.name == "level_completed")
                {
                    levelCompletions++;
                    if (evt.value.HasValue)
                    {
                        totalScore += (int)evt.value.Value;
                    }
                }
            }

            // Update UI
            UpdateProgressUI(levelCompletions, totalScore);
        },
        (error) =>
        {
            Debug.LogError($"❌ Failed to load progress: {error.Message}");
            HandleEventError(error);
        }
    );
}
```

## Error Handling

### Comprehensive Error Handler

```csharp
void HandleEventError(SkillBaseError error)
{
    switch (error.StatusCode)
    {
        case 401:
            // Unauthorized - token expired
            Debug.Log("⚠️ Token expired, refreshing...");
            client.RefreshToken(
                (authResponse) =>
                {
                    Debug.Log("✅ Token refreshed, retry operation");
                    // Retry the failed operation
                },
                (refreshError) =>
                {
                    Debug.LogError("❌ Token refresh failed");
                    PlayerPrefs.DeleteKey("jwt_token");
                    ShowLoginUI();
                }
            );
            break;

        case 400:
            // Bad request
            Debug.LogError($"Invalid request: {error.Message}");
            break;

        case null:
        case 0:
            // Network error - SDK will retry automatically
            Debug.LogWarning("⚠️ Network error - will retry automatically");
            break;

        case 500:
        case 502:
        case 503:
            // Server error - SDK will retry automatically
            Debug.LogWarning("⚠️ Server error - will retry automatically");
            break;

        default:
            Debug.LogError($"API error ({error.StatusCode}): {error.Message}");
            break;
    }
}
```

## Mobile-Ready Features

### Automatic Retry

The SDK automatically retries failed requests with exponential backoff:

- **Network errors**: Retried automatically
- **5xx server errors**: Retried automatically
- **401 errors**: Token refresh attempted, then retry

### Token Management

- **Automatic refresh**: On 401 errors
- **Token persistence**: Via `onTokenRefresh` callback
- **Secure storage**: Use PlayerPrefs (or secure storage in production)

### Offline Support

For offline support, implement a queue system:

```csharp
private Queue<EventData> eventQueue = new Queue<EventData>();

void QueueEvent(string userId, string name, double? value, Dictionary<string, object> metadata)
{
    eventQueue.Enqueue(new EventData { userId, name, value, metadata });
    TryProcessQueue();
}

void TryProcessQueue()
{
    if (eventQueue.Count == 0) return;

    var eventData = eventQueue.Peek();
    client.CreateEvent(
        eventData.userId,
        eventData.name,
        eventData.value,
        eventData.metadata,
        (evt) =>
        {
            eventQueue.Dequeue();
            TryProcessQueue(); // Process next event
        },
        (error) =>
        {
            if (error.StatusCode == 0)
            {
                // Network error - keep in queue, retry later
                Debug.Log("Event queued, will retry when online");
            }
            else
            {
                // Other error - remove from queue
                eventQueue.Dequeue();
                TryProcessQueue();
            }
        }
    );
}
```

## Complete Example

See `Examples/SkillBaseExample.cs` for a complete working example.

## Best Practices

1. **Initialize once**: Use singleton pattern (SkillBaseClientWrapper.Instance)
2. **Save tokens**: Use `onTokenRefresh` callback to persist tokens
3. **Handle errors**: Always provide error callbacks
4. **Retry logic**: SDK handles retries automatically, but you can implement custom retry for critical operations
5. **Offline queue**: Implement event queue for offline scenarios
6. **User ID**: Use consistent user ID (device ID, account ID, etc.)

## Testing

Test your integration:

1. **Network errors**: Disable network, verify retry behavior
2. **Token expiration**: Wait for token to expire, verify auto-refresh
3. **Server errors**: Use invalid API URL, verify retry behavior
4. **Offline mode**: Queue events when offline, verify they're sent when online

