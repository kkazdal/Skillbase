using System;
using System.Collections.Generic;

namespace SkillBase
{
    /// <summary>
    /// Event object returned from the API
    /// </summary>
    [Serializable]
    public class Event
    {
        public string id;
        public string projectId;
        public string userId;
        public string name;
        public double? value;
        public Dictionary<string, object> metadata;
        public string createdAt;
    }

    /// <summary>
    /// User object returned from the API
    /// </summary>
    [Serializable]
    public class User
    {
        public string id;
        public string email;
        public string name;
        public string createdAt;
    }

    /// <summary>
    /// Project object returned from the API
    /// </summary>
    [Serializable]
    public class Project
    {
        public string id;
        public string name;
        public string apiKey;
        public string environment;
        public string userId;
        public string createdAt;
    }

    /// <summary>
    /// Auth response from register/login
    /// </summary>
    [Serializable]
    public class AuthResponse
    {
        public User user;
        public string accessToken;
    }

    /// <summary>
    /// Project creation response
    /// </summary>
    [Serializable]
    public class CreateProjectResponse
    {
        public Project project;
        public string apiKey;
    }

    /// <summary>
    /// Create event response
    /// </summary>
    [Serializable]
    public class CreateEventResponse
    {
        public bool success;
        public string eventId;
    }

    /// <summary>
    /// SDK configuration options
    /// </summary>
    [Serializable]
    public class SkillBaseClientOptions
    {
        public string apiKey;
        public string jwt;
        public string baseUrl = "http://localhost:3000";
        public int maxRetries = 3;
        public int retryDelayMs = 1000;
        public bool autoRefreshToken = true;
        public Action<string> onTokenRefresh;
    }

    /// <summary>
    /// Wrapper for JSON array parsing (Unity JsonUtility limitation)
    /// </summary>
    [Serializable]
    internal class JsonArrayWrapper<T>
    {
        public T[] items;
    }

    /// <summary>
    /// Wrapper for Event array
    /// </summary>
    [Serializable]
    internal class EventArray
    {
        public Event[] items;
    }

    /// <summary>
    /// Wrapper for Project array
    /// </summary>
    [Serializable]
    internal class ProjectArray
    {
        public Project[] items;
    }
}

