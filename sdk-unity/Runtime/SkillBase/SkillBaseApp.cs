using System;
using UnityEngine;

namespace SkillBase
{
    /// <summary>
    /// Internal: Main SkillBase application instance
    /// Manages lifecycle, token storage, and API clients
    /// </summary>
    internal class SkillBaseApp : IDisposable
    {
        private readonly SkillBaseConfig _config;
        private readonly SkillBaseTokenStorage _tokenStorage;
        private readonly SkillBaseClientWrapper _clientWrapper;
        
        public SkillBaseAuth Auth { get; private set; }
        public SkillBaseEvents Events { get; private set; }
        public SkillBaseProjects Projects { get; private set; }

        internal SkillBaseApp(Environment environment)
        {
            _config = SkillBaseConfig.Default(environment);
            
            // Create token storage (handles PlayerPrefs automatically)
            _tokenStorage = new SkillBaseTokenStorage();

            // Create internal client wrapper
            var gameObject = new GameObject("SkillBaseApp");
            UnityEngine.Object.DontDestroyOnLoad(gameObject);
            _clientWrapper = gameObject.AddComponent<SkillBaseClientWrapper>();

            // Initialize internal client with auto token management
            _clientWrapper.Initialize(new SkillBaseClientOptions
            {
                baseUrl = _config.BaseUrl,
                maxRetries = _config.MaxRetries,
                retryDelayMs = _config.RetryDelayMs,
                autoRefreshToken = true,
                onTokenRefresh = (token) =>
                {
                    _tokenStorage.SaveToken(token);
                }
            });

            // Load saved token if exists
            var savedToken = _tokenStorage.LoadToken();
            if (!string.IsNullOrEmpty(savedToken))
            {
                _clientWrapper.Client.SetJwt(savedToken);
            }

            // Create public API facades
            Auth = new SkillBaseAuth(_clientWrapper, _tokenStorage);
            Events = new SkillBaseEvents(_clientWrapper);
            Projects = new SkillBaseProjects(_clientWrapper);
        }

        internal SkillBaseApp(SkillBaseConfig config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            
            // Create token storage (handles PlayerPrefs automatically)
            _tokenStorage = new SkillBaseTokenStorage();

            // Create internal client wrapper
            var gameObject = new GameObject("SkillBaseApp");
            UnityEngine.Object.DontDestroyOnLoad(gameObject);
            _clientWrapper = gameObject.AddComponent<SkillBaseClientWrapper>();

            // Initialize internal client with auto token management
            _clientWrapper.Initialize(new SkillBaseClientOptions
            {
                baseUrl = _config.BaseUrl,
                maxRetries = _config.MaxRetries,
                retryDelayMs = _config.RetryDelayMs,
                autoRefreshToken = true,
                onTokenRefresh = (token) =>
                {
                    _tokenStorage.SaveToken(token);
                }
            });

            // Load saved token if exists
            var savedToken = _tokenStorage.LoadToken();
            if (!string.IsNullOrEmpty(savedToken))
            {
                _clientWrapper.Client.SetJwt(savedToken);
            }

            // Create public API facades
            Auth = new SkillBaseAuth(_clientWrapper, _tokenStorage);
            Events = new SkillBaseEvents(_clientWrapper);
            Projects = new SkillBaseProjects(_clientWrapper);
        }

        public void Dispose()
        {
            if (_clientWrapper != null && _clientWrapper.gameObject != null)
            {
                UnityEngine.Object.Destroy(_clientWrapper.gameObject);
            }
        }
    }
}

