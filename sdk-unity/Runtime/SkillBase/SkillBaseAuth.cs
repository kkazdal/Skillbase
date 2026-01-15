using System;
using UnityEngine;

namespace SkillBase
{
    /// <summary>
    /// Authentication API for SkillBase
    /// Simple, safe, and automatic token management
    /// </summary>
    public class SkillBaseAuth
    {
        private readonly SkillBaseClientWrapper _client;
        private readonly SkillBaseTokenStorage _tokenStorage;
        private User _currentUser;

        internal SkillBaseAuth(SkillBaseClientWrapper client, SkillBaseTokenStorage tokenStorage)
        {
            _client = client;
            _tokenStorage = tokenStorage;
        }

        /// <summary>
        /// Current authenticated user (null if not logged in)
        /// </summary>
        public User CurrentUser => _currentUser;

        /// <summary>
        /// Check if user is authenticated
        /// </summary>
        public bool IsAuthenticated => _currentUser != null;

        /// <summary>
        /// Register a new user
        /// </summary>
        /// <param name="email">User email</param>
        /// <param name="password">User password (min 6 characters)</param>
        /// <param name="name">User name (optional)</param>
        /// <param name="onSuccess">Callback on success</param>
        /// <param name="onError">Callback on error</param>
        public void Register(
            string email,
            string password,
            string name = null,
            Action<User> onSuccess = null,
            Action<SkillBaseError> onError = null)
        {
            _client.Register(
                email,
                password,
                name,
                (authResponse) =>
                {
                    _currentUser = authResponse.user;
                    // Token is automatically saved via onTokenRefresh callback
                    onSuccess?.Invoke(_currentUser);
                },
                (error) =>
                {
                    Debug.LogError($"SkillBase Register failed: {error.Message}");
                    onError?.Invoke(error);
                }
            );
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        /// <param name="email">User email</param>
        /// <param name="password">User password</param>
        /// <param name="onSuccess">Callback on success</param>
        /// <param name="onError">Callback on error</param>
        public void Login(
            string email,
            string password,
            Action<User> onSuccess = null,
            Action<SkillBaseError> onError = null)
        {
            _client.Login(
                email,
                password,
                (authResponse) =>
                {
                    _currentUser = authResponse.user;
                    // Token is automatically saved via onTokenRefresh callback
                    onSuccess?.Invoke(_currentUser);
                },
                (error) =>
                {
                    Debug.LogError($"SkillBase Login failed: {error.Message}");
                    onError?.Invoke(error);
                }
            );
        }

        /// <summary>
        /// Logout current user
        /// Clears token and user data
        /// </summary>
        public void Logout()
        {
            _client.Logout();
            _tokenStorage.ClearToken();
            _currentUser = null;
        }

        /// <summary>
        /// Refresh authentication token (automatic, but can be called manually)
        /// </summary>
        /// <param name="onSuccess">Callback on success</param>
        /// <param name="onError">Callback on error</param>
        public void RefreshToken(
            Action<User> onSuccess = null,
            Action<SkillBaseError> onError = null)
        {
            _client.RefreshToken(
                (authResponse) =>
                {
                    _currentUser = authResponse.user;
                    onSuccess?.Invoke(_currentUser);
                },
                (error) =>
                {
                    // Token expired, clear user
                    _currentUser = null;
                    _tokenStorage.ClearToken();
                    Debug.LogWarning("SkillBase token refresh failed. User must login again.");
                    onError?.Invoke(error);
                }
            );
        }
    }
}

