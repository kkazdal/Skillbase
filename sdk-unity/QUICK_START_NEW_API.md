# SkillBase Unity SDK - New API Quick Start

## 🚀 One-Line Initialization

```csharp
using SkillBase;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    void Start()
    {
        // That's it! One line to initialize
        SkillBase.Initialize(Environment.Development);
        
        // Check if user is logged in
        if (SkillBase.IsAuthenticated)
        {
            Debug.Log($"Welcome back, {SkillBase.CurrentUser.email}!");
        }
    }
}
```

## 📝 Complete Example

```csharp
using SkillBase;
using UnityEngine;
using System.Collections.Generic;

public class MyGame : MonoBehaviour
{
    void Start()
    {
        // Initialize SDK
        SkillBase.Initialize(Environment.Development);
        
        // Login user
        SkillBase.Auth.Login(
            email: "player@game.com",
            password: "password123",
            onSuccess: (user) =>
            {
                Debug.Log($"✅ Logged in: {user.email}");
                StartGame();
            },
            onError: (error) =>
            {
                Debug.LogError($"Login failed: {error.Message}");
            }
        );
    }

    void StartGame()
    {
        // User is automatically authenticated
        Debug.Log($"Current user: {SkillBase.CurrentUser.name}");
    }

    void OnLevelComplete(int level, int score)
    {
        // Track event (automatic user ID)
        SkillBase.Events.Track(
            name: "level_completed",
            value: score,
            metadata: new Dictionary<string, object>
            {
                { "level", level },
                { "platform", Application.platform.ToString() }
            }
        );
    }

    void LoadProgress()
    {
        // Get user's events
        SkillBase.Events.Get(
            onSuccess: (events) =>
            {
                Debug.Log($"Found {events.Length} events");
            }
        );
    }
}
```

## 🎯 Key Features

### ✅ Simple
- One-line initialization
- No manual token management
- No singleton patterns

### ✅ Safe
- Automatic token persistence
- Automatic token refresh
- Lifecycle-aware

### ✅ Familiar
- Firebase/PlayFab-style API
- Static methods
- Clear separation of concerns

## 📚 API Reference

### Initialization

```csharp
// Simple (Development)
SkillBase.Initialize(Environment.Development);

// Simple (Production)
SkillBase.Initialize(Environment.Production);

// Advanced (Custom config)
var config = new SkillBaseConfig
{
    BaseUrl = "https://custom-api.com"
};
SkillBase.Initialize(config);
```

### Authentication

```csharp
// Register
SkillBase.Auth.Register(email, password, name, onSuccess, onError);

// Login
SkillBase.Auth.Login(email, password, onSuccess, onError);

// Logout
SkillBase.Auth.Logout();

// Check auth
if (SkillBase.IsAuthenticated)
{
    var user = SkillBase.CurrentUser;
}
```

### Events

```csharp
// Track event
SkillBase.Events.Track("level_completed", score, metadata, onSuccess, onError);

// Get events
SkillBase.Events.Get(onSuccess, onError);
```

### Projects

```csharp
// Create project
SkillBase.Projects.Create(name, description, (project, apiKey) => { ... }, onError);

// List projects
SkillBase.Projects.List((projects) => { ... }, onError);
```

## 🔄 Migration from Old API

See [API_DESIGN.md](./API_DESIGN.md) for complete migration guide.

**Old:**
```csharp
var client = SkillBaseClientWrapper.Instance;
client.Initialize(new SkillBaseClientOptions { ... });
client.Register(...);
```

**New:**
```csharp
SkillBase.Initialize(Environment.Development);
SkillBase.Auth.Register(...);
```

## ⚠️ Important Notes

1. **Initialize once** - Call `SkillBase.Initialize()` once in your game startup
2. **No manual tokens** - SDK handles tokens automatically
3. **Environment selection** - Use `Environment.Development` for localhost, `Environment.Production` for production
4. **Current user** - Access via `SkillBase.CurrentUser` (null if not authenticated)

