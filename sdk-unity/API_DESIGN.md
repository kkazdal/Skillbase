# SkillBase Unity SDK - New API Design

## 🎯 Design Philosophy

**Simple, Safe, Opinionated**

- **One-line initialization** - No complex setup
- **Automatic token management** - Never expose JWTs to developers
- **Lifecycle-aware** - Handles Unity scene reloads, domain reloads
- **Firebase/PlayFab-style** - Familiar patterns for Unity developers

## 📚 Public API Surface

### Initialization

```csharp
// Simple (90% of users)
SkillBase.Initialize(Environment.Development);  // localhost:3000
SkillBase.Initialize(Environment.Production);   // api.skillbase.com

// Advanced (10% of users)
var config = new SkillBaseConfig
{
    BaseUrl = "https://custom-api.com",
    MaxRetries = 5
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

// Check auth status
if (SkillBase.IsAuthenticated)
{
    var user = SkillBase.CurrentUser;
}

// Get current user
User user = SkillBase.CurrentUser; // null if not authenticated
```

### Events

```csharp
// Track event (uses current user automatically)
SkillBase.Events.Track("level_completed", score, metadata, onSuccess, onError);

// Get events (current user)
SkillBase.Events.Get(onSuccess, onError);

// Get events (specific user - requires API key)
SkillBase.Events.Get(userId, onSuccess, onError);
```

### Projects (Future)

```csharp
SkillBase.Projects.Create(name, description, onSuccess, onError);
SkillBase.Projects.List(onSuccess, onError);
```

## 🔒 What's Internal (Hidden from Developers)

### ❌ DO NOT EXPOSE

- `SkillBaseClientWrapper` - Internal implementation detail
- `SkillBaseClient` - Low-level HTTP client
- `SkillBaseClientOptions` - Configuration internals
- Token storage details (PlayerPrefs vs secure storage)
- Retry logic implementation
- Base URL configuration (except environment)
- HTTP status codes (wrapped in `SkillBaseError`)
- Coroutine management

### ✅ PUBLIC API ONLY

- `SkillBase` static class
- `SkillBase.Auth` - Authentication
- `SkillBase.Events` - Event tracking
- `SkillBase.Projects` - Project management
- `SkillBaseConfig` - Advanced configuration (optional)
- `Environment` enum - Development/Production

## 🎮 Unity-Specific Design Decisions

### 1. Static API (No Singleton Pattern)

**Why:** Unity developers expect static APIs (like Firebase, PlayFab)

```csharp
// ✅ GOOD - Static API
SkillBase.Auth.Login(...);

// ❌ BAD - Singleton pattern
SkillBaseClientWrapper.Instance.Login(...);
```

### 2. Automatic Token Persistence

**Why:** Developers shouldn't manage tokens manually

```csharp
// ✅ GOOD - Automatic
SkillBase.Auth.Login(email, password, ...);
// Token is automatically saved and loaded

// ❌ BAD - Manual token management
clientWrapper.Client.SetJwt(token);
PlayerPrefs.SetString("token", token);
```

### 3. Environment-Based Configuration

**Why:** Simple choice between dev/prod, not URLs

```csharp
// ✅ GOOD - Environment enum
SkillBase.Initialize(Environment.Development);

// ❌ BAD - Raw URLs
SkillBase.Initialize("http://localhost:3000");
```

### 4. Lifecycle-Aware Initialization

**Why:** Handle Unity scene reloads and domain reloads

- SDK auto-initializes on first use
- DontDestroyOnLoad for persistence
- Safe to call `Initialize()` multiple times (idempotent)

### 5. Current User Pattern

**Why:** Common Unity pattern (Firebase, PlayFab)

```csharp
// ✅ GOOD - Static property
if (SkillBase.IsAuthenticated)
{
    var user = SkillBase.CurrentUser;
}

// ❌ BAD - Manual user tracking
private string userId;
```

## 📋 DO / DON'T Rules

### ✅ DO

```csharp
// Initialize once in GameManager.Start()
SkillBase.Initialize(Environment.Development);

// Use static API
SkillBase.Auth.Login(...);
SkillBase.Events.Track(...);

// Check authentication status
if (SkillBase.IsAuthenticated) { ... }

// Use callbacks for async operations
SkillBase.Auth.Login(email, password,
    onSuccess: (user) => { ... },
    onError: (error) => { ... }
);
```

### ❌ DON'T

```csharp
// Don't access internal classes
SkillBaseClientWrapper.Instance... // ❌

// Don't manage tokens manually
PlayerPrefs.SetString("token", ...); // ❌

// Don't expose HTTP details
if (error.StatusCode == 401) { ... } // ❌ Use error.Message

// Don't initialize multiple times unnecessarily
// (It's safe, but unnecessary)

// Don't store user ID manually
private string userId; // ❌ Use SkillBase.CurrentUser
```

## 🔄 Migration Guide

### Old API → New API

#### Initialization

**OLD:**
```csharp
var client = SkillBaseClientWrapper.Instance;
client.Initialize(new SkillBaseClientOptions
{
    baseUrl = "http://localhost:3000",
    maxRetries = 3,
    retryDelayMs = 1000,
    autoRefreshToken = true,
    onTokenRefresh = (token) => PlayerPrefs.SetString("token", token)
});
```

**NEW:**
```csharp
SkillBase.Initialize(Environment.Development);
```

#### Authentication

**OLD:**
```csharp
client.Register(email, password, name, 
    (auth) => { userId = auth.user.id; },
    (error) => { ... }
);
```

**NEW:**
```csharp
SkillBase.Auth.Register(email, password, name,
    onSuccess: (user) => { /* user is automatically stored */ },
    onError: (error) => { ... }
);
```

#### Events

**OLD:**
```csharp
client.CreateEvent(userId, "level_completed", score, metadata,
    (evt) => { ... },
    (error) => { ... }
);
```

**NEW:**
```csharp
SkillBase.Events.Track("level_completed", score, metadata,
    onSuccess: (evt) => { ... },
    onError: (error) => { ... }
);
```

#### User Management

**OLD:**
```csharp
private string userId;
if (PlayerPrefs.HasKey("token"))
{
    client.Client.SetJwt(PlayerPrefs.GetString("token"));
}
```

**NEW:**
```csharp
// Automatic!
if (SkillBase.IsAuthenticated)
{
    var user = SkillBase.CurrentUser;
}
```

## 🚀 Example: Complete Game Integration

```csharp
using SkillBase;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    void Start()
    {
        // Initialize SDK (one line!)
        SkillBase.Initialize(Environment.Development);

        // Check if user is logged in
        if (SkillBase.IsAuthenticated)
        {
            StartGame();
        }
        else
        {
            ShowLogin();
        }
    }

    void ShowLogin()
    {
        SkillBase.Auth.Login("player@game.com", "password",
            onSuccess: (user) => StartGame(),
            onError: (error) => Debug.LogError(error.Message)
        );
    }

    void StartGame()
    {
        Debug.Log($"Welcome {SkillBase.CurrentUser.name}!");
    }

    void OnLevelComplete(int level, int score)
    {
        SkillBase.Events.Track("level_completed", score,
            metadata: new Dictionary<string, object> { { "level", level } }
        );
    }

    void OnQuit()
    {
        SkillBase.Auth.Logout();
    }
}
```

## 🎯 Key Benefits

1. **Simple** - One-line initialization, no boilerplate
2. **Safe** - Automatic token management, no manual JWT handling
3. **Familiar** - Firebase/PlayFab-style API
4. **Lifecycle-aware** - Handles Unity quirks automatically
5. **Testable** - Clear separation of concerns
6. **Opinionated** - Strong defaults, advanced config optional

## 📝 Breaking Changes

### Removed (Internal Only)

- `SkillBaseClientWrapper.Instance` - Use `SkillBase` static API
- `SkillBaseClientOptions` - Use `SkillBaseConfig` or environment enum
- Manual token management - Automatic now
- `client.Client.SetJwt()` - Internal only

### New (Public API)

- `SkillBase.Initialize()` - Simple initialization
- `SkillBase.Auth` - Authentication API
- `SkillBase.Events` - Events API
- `SkillBase.CurrentUser` - Current user property
- `SkillBase.IsAuthenticated` - Auth status check

## 🔮 Future Enhancements

- [ ] Async/await support (Unity 2021.3+)
- [ ] Reactive extensions (Observable pattern)
- [ ] Offline event queue
- [ ] Batch event tracking
- [ ] Custom secure storage providers
- [ ] Analytics dashboard integration

