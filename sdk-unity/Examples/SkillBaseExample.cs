using SkillBase;
using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Complete example showing SkillBase SDK usage in Unity
/// Mobile-ready with token persistence and error handling
/// </summary>
public class SkillBaseExample : MonoBehaviour
{
    private SkillBaseClientWrapper client;
    private string userId;

    void Start()
    {
        InitializeSkillBase();
    }

    void InitializeSkillBase()
    {
        // Initialize client with mobile-ready options
        client = SkillBaseClientWrapper.Instance;
        client.Initialize(new SkillBaseClientOptions
        {
            baseUrl = "http://localhost:3000", // Change to your API URL
            maxRetries = 3,
            retryDelayMs = 1000,
            autoRefreshToken = true,
            onTokenRefresh = (newToken) =>
            {
                // Save token to PlayerPrefs (use secure storage in production)
                PlayerPrefs.SetString("skillbase_jwt", newToken);
                PlayerPrefs.Save();
                Debug.Log("✅ Token refreshed and saved");
            }
        });

        // Load saved token if exists
        LoadSavedToken();

        // Example: Register or login
        // Uncomment one of these:
        // RegisterUser();
        // LoginUser();
    }

    void LoadSavedToken()
    {
        string savedToken = PlayerPrefs.GetString("skillbase_jwt", "");
        if (!string.IsNullOrEmpty(savedToken))
        {
            client.Client.SetJwt(savedToken);
            Debug.Log("✅ Loaded saved token");
        }
    }

    void RegisterUser()
    {
        Debug.Log("📝 Registering user...");
        client.Register(
            "unity_player@example.com",
            "password123",
            "Unity Player",
            (authResponse) =>
            {
                Debug.Log($"✅ User registered: {authResponse.user.id}");
                userId = authResponse.user.id;
                // Token is automatically saved via onTokenRefresh callback
            },
            (error) =>
            {
                Debug.LogError($"❌ Registration failed: {error.Message}");
                if (error.StatusCode == 409)
                {
                    Debug.Log("User already exists, trying login...");
                    LoginUser();
                }
            }
        );
    }

    void LoginUser()
    {
        Debug.Log("🔐 Logging in...");
        client.Login(
            "unity_player@example.com",
            "password123",
            (authResponse) =>
            {
                Debug.Log($"✅ Logged in: {authResponse.user.id}");
                userId = authResponse.user.id;
                // Token is automatically saved via onTokenRefresh callback
            },
            (error) =>
            {
                Debug.LogError($"❌ Login failed: {error.Message}");
            }
        );
    }

    // Example: Track level completion
    public void OnLevelCompleted(int level, int score)
    {
        if (string.IsNullOrEmpty(userId))
        {
            Debug.LogWarning("User not logged in, skipping event");
            return;
        }

        var metadata = new Dictionary<string, object>
        {
            { "level", level },
            { "score", score },
            { "timestamp", System.DateTime.UtcNow.ToString("o") },
            { "device", SystemInfo.deviceModel },
            { "platform", Application.platform.ToString() }
        };

        Debug.Log($"📊 Tracking level completion: Level {level}, Score {score}");

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
                Debug.LogError($"❌ Failed to track event: {error.Message}");
                HandleEventError(error);
            }
        );
    }

    // Example: Track purchase
    public void OnPurchaseMade(string itemId, double price)
    {
        if (string.IsNullOrEmpty(userId))
        {
            Debug.LogWarning("User not logged in, skipping event");
            return;
        }

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
            (evt) =>
            {
                Debug.Log($"✅ Purchase tracked: {evt.id}");
            },
            (error) =>
            {
                Debug.LogError($"❌ Failed to track purchase: {error.Message}");
                HandleEventError(error);
            }
        );
    }

    // Example: Load user progress
    public void LoadUserProgress()
    {
        if (string.IsNullOrEmpty(userId))
        {
            Debug.LogWarning("User not logged in");
            return;
        }

        Debug.Log("📥 Loading user progress...");

        client.GetEvents(
            userId,
            (events) =>
            {
                Debug.Log($"✅ Loaded {events.Length} events");

                // Filter level completions
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

                Debug.Log($"Levels completed: {levelCompletions}");
                Debug.Log($"Total score: {totalScore}");
            },
            (error) =>
            {
                Debug.LogError($"❌ Failed to load progress: {error.Message}");
                HandleEventError(error);
            }
        );
    }

    void HandleEventError(SkillBaseError error)
    {
        switch (error.StatusCode)
        {
            case 401:
                Debug.Log("⚠️ Token expired, refreshing...");
                client.RefreshToken(
                    (authResponse) =>
                    {
                        Debug.Log("✅ Token refreshed, retry operation");
                        // Retry the failed operation here
                    },
                    (refreshError) =>
                    {
                        Debug.LogError("❌ Token refresh failed, need to login again");
                        PlayerPrefs.DeleteKey("skillbase_jwt");
                        // Show login UI or auto-login
                    }
                );
                break;
            case 400:
                Debug.LogError($"Invalid request: {error.Message}");
                break;
            case null:
            case 0:
                Debug.LogWarning("⚠️ Network error - event will be retried automatically");
                break;
            default:
                Debug.LogError($"API error ({error.StatusCode}): {error.Message}");
                break;
        }
    }

    // Example: Manual token refresh
    void RefreshTokenManually()
    {
        client.RefreshToken(
            (authResponse) =>
            {
                Debug.Log("✅ Token refreshed manually");
            },
            (error) =>
            {
                Debug.LogError($"❌ Manual token refresh failed: {error.Message}");
                // Token expired, need to login again
                PlayerPrefs.DeleteKey("skillbase_jwt");
            }
        );
    }

    // Example: Logout
    void Logout()
    {
        client.Logout();
        PlayerPrefs.DeleteKey("skillbase_jwt");
        userId = null;
        Debug.Log("✅ Logged out");
    }
}

