using System;
using UnityEngine;

namespace SkillBase
{
    /// <summary>
    /// Main entry point for SkillBase Unity SDK
    /// Firebase/PlayFab-style simple API
    /// </summary>
    public static class SkillBaseSDK
    {
        private static bool _isInitialized = false;
        private static SkillBaseApp _app;
        
        /// <summary>
        /// Initialize SkillBase SDK with default settings
        /// Call this once in your game's initialization (e.g., GameManager.Start)
        /// </summary>
        /// <param name="environment">Environment: "development" (localhost) or "production" (api.skillbase.com)</param>
        public static void Initialize(Environment environment = Environment.Development)
        {
            if (_isInitialized)
            {
                Debug.LogWarning("SkillBase is already initialized. Ignoring duplicate initialization.");
                return;
            }

            _app = new SkillBaseApp(environment);
            _isInitialized = true;
            
            Debug.Log($"✅ SkillBase initialized: {environment}");
        }

        /// <summary>
        /// Initialize with custom configuration (advanced users only)
        /// </summary>
        public static void Initialize(SkillBaseConfig config)
        {
            if (_isInitialized)
            {
                Debug.LogWarning("SkillBase is already initialized. Ignoring duplicate initialization.");
                return;
            }

            _app = new SkillBaseApp(config);
            _isInitialized = true;
            
            Debug.Log($"✅ SkillBase initialized with custom config");
        }

        /// <summary>
        /// Check if SDK is initialized
        /// </summary>
        public static bool IsInitialized => _isInitialized;

        /// <summary>
        /// Authentication API
        /// </summary>
        public static SkillBaseAuth Auth
        {
            get
            {
                EnsureInitialized();
                return _app.Auth;
            }
        }

        /// <summary>
        /// Events API
        /// </summary>
        public static SkillBaseEvents Events
        {
            get
            {
                EnsureInitialized();
                return _app.Events;
            }
        }

        /// <summary>
        /// Projects API
        /// </summary>
        public static SkillBaseProjects Projects
        {
            get
            {
                EnsureInitialized();
                return _app.Projects;
            }
        }

        /// <summary>
        /// Current user (null if not authenticated)
        /// </summary>
        public static User CurrentUser => _app?.Auth?.CurrentUser;

        /// <summary>
        /// Check if user is authenticated
        /// </summary>
        public static bool IsAuthenticated => _app?.Auth?.IsAuthenticated ?? false;

        private static void EnsureInitialized()
        {
            if (!_isInitialized)
            {
                throw new InvalidOperationException(
                    "SkillBase is not initialized. Call SkillBaseSDK.Initialize() first in your game's startup code."
                );
            }
        }

        /// <summary>
        /// Reset SDK (for testing or re-initialization)
        /// </summary>
        internal static void Reset()
        {
            _app?.Dispose();
            _app = null;
            _isInitialized = false;
        }
    }

    /// <summary>
    /// Environment selection for SDK initialization
    /// </summary>
    public enum Environment
    {
        /// <summary>
        /// Development: Uses localhost:3000
        /// </summary>
        Development,
        
        /// <summary>
        /// Production: Uses api.skillbase.com
        /// </summary>
        Production
    }

    /// <summary>
    /// Backward compatibility alias for SkillBaseSDK
    /// Use SkillBaseSDK for new code
    /// </summary>
    [System.Obsolete("Use SkillBaseSDK instead. This alias will be removed in a future version.")]
    public static class SkillBase
    {
        public static void Initialize(Environment environment = Environment.Development) => SkillBaseSDK.Initialize(environment);
        public static void Initialize(SkillBaseConfig config) => SkillBaseSDK.Initialize(config);
        public static bool IsInitialized => SkillBaseSDK.IsInitialized;
        public static SkillBaseAuth Auth => SkillBaseSDK.Auth;
        public static SkillBaseEvents Events => SkillBaseSDK.Events;
        public static SkillBaseProjects Projects => SkillBaseSDK.Projects;
        public static User CurrentUser => SkillBaseSDK.CurrentUser;
        public static bool IsAuthenticated => SkillBaseSDK.IsAuthenticated;
    }
}

