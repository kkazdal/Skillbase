using System;
using System.Collections;
using UnityEngine;

namespace SkillBase
{
    /// <summary>
    /// MonoBehaviour wrapper for SkillBaseClient
    /// Use this in your Unity scripts to handle coroutines automatically
    /// </summary>
    public class SkillBaseClientWrapper : MonoBehaviour
    {
        private SkillBaseClient client;
        private static SkillBaseClientWrapper instance;

        /// <summary>
        /// Initialize the client
        /// </summary>
        public void Initialize(SkillBaseClientOptions options)
        {
            client = new SkillBaseClient(options);
        }

        /// <summary>
        /// Get singleton instance (for convenience)
        /// </summary>
        public static SkillBaseClientWrapper Instance
        {
            get
            {
                if (instance == null)
                {
                    GameObject go = new GameObject("SkillBaseClient");
                    instance = go.AddComponent<SkillBaseClientWrapper>();
                    DontDestroyOnLoad(go);
                }
                return instance;
            }
        }

        /// <summary>
        /// Get the client instance
        /// </summary>
        public SkillBaseClient Client => client;

        // ============================================================================
        // AUTH METHODS (Convenience wrappers)
        // ============================================================================

        public void Register(string email, string password, string name, Action<AuthResponse> onSuccess, Action<SkillBaseError> onError)
        {
            client?.Register(this, email, password, name, onSuccess, onError);
        }

        public void Login(string email, string password, Action<AuthResponse> onSuccess, Action<SkillBaseError> onError)
        {
            client?.Login(this, email, password, onSuccess, onError);
        }

        public void RefreshToken(Action<AuthResponse> onSuccess, Action<SkillBaseError> onError)
        {
            client?.RefreshToken(this, onSuccess, onError);
        }

        public void Logout()
        {
            client?.Logout();
        }

        // ============================================================================
        // EVENT METHODS (Convenience wrappers)
        // ============================================================================

        public void CreateEvent(string userId, string name, double? value, System.Collections.Generic.Dictionary<string, object> metadata, Action<Event> onSuccess, Action<SkillBaseError> onError)
        {
            client?.CreateEvent(this, userId, name, value, metadata, onSuccess, onError);
        }

        public void GetEvents(string userId, Action<Event[]> onSuccess, Action<SkillBaseError> onError)
        {
            client?.GetEvents(this, userId, onSuccess, onError);
        }

        // ============================================================================
        // PROJECT METHODS (Convenience wrappers)
        // ============================================================================

        public void CreateProject(string name, string description, Action<CreateProjectResponse> onSuccess, Action<SkillBaseError> onError)
        {
            client?.CreateProject(this, name, description, onSuccess, onError);
        }

        public void ListProjects(Action<Project[]> onSuccess, Action<SkillBaseError> onError)
        {
            client?.ListProjects(this, onSuccess, onError);
        }
    }
}

