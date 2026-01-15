using SkillBase;
using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// NEW API EXAMPLE - Simple, Firebase-style usage
/// This is how Unity developers should use SkillBase
/// </summary>
public class SkillBaseNewAPIExample : MonoBehaviour
{
    void Start()
    {
        // ONE LINE INITIALIZATION - That's it!
        SkillBase.Initialize(Environment.Development); // or Environment.Production

        // Check if user is already logged in (from previous session)
        if (SkillBase.IsAuthenticated)
        {
            Debug.Log($"Welcome back, {SkillBase.CurrentUser.email}!");
            LoadUserData();
        }
        else
        {
            ShowLoginScreen();
        }
    }

    void ShowLoginScreen()
    {
        // Register new user
        SkillBase.Auth.Register(
            email: "player@example.com",
            password: "password123",
            name: "Player Name",
            onSuccess: (user) =>
            {
                Debug.Log($"✅ Registered: {user.email}");
                OnUserAuthenticated();
            },
            onError: (error) =>
            {
                if (error.StatusCode == 409)
                {
                    // User exists, try login
                    SkillBase.Auth.Login(
                        email: "player@example.com",
                        password: "password123",
                        onSuccess: (user) =>
                        {
                            Debug.Log($"✅ Logged in: {user.email}");
                            OnUserAuthenticated();
                        },
                        onError: (loginError) =>
                        {
                            Debug.LogError($"Login failed: {loginError.Message}");
                        }
                    );
                }
                else
                {
                    Debug.LogError($"Registration failed: {error.Message}");
                }
            }
        );
    }

    void OnUserAuthenticated()
    {
        Debug.Log($"Current user: {SkillBase.CurrentUser.id}");
        LoadUserData();
    }

    void LoadUserData()
    {
        // Get user's events
        SkillBase.Events.Get(
            onSuccess: (events) =>
            {
                Debug.Log($"Loaded {events.Length} events");
                foreach (var evt in events)
                {
                    Debug.Log($"  - {evt.name}: {evt.value}");
                }
            },
            onError: (error) =>
            {
                Debug.LogError($"Failed to load events: {error.Message}");
            }
        );
    }

    // Track level completion
    public void OnLevelCompleted(int level, int score)
    {
        SkillBase.Events.Track(
            name: "level_completed",
            value: score,
            metadata: new Dictionary<string, object>
            {
                { "level", level },
                { "platform", Application.platform.ToString() }
            },
            onSuccess: (evt) =>
            {
                Debug.Log($"✅ Event tracked: {evt.id}");
            },
            onError: (error) =>
            {
                Debug.LogError($"Failed to track event: {error.Message}");
            }
        );
    }

    // Logout
    public void OnLogoutButton()
    {
        SkillBase.Auth.Logout();
        Debug.Log("Logged out");
        ShowLoginScreen();
    }
}

