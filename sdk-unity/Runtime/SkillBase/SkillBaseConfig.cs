using System;
using UnityEngine;

namespace SkillBase
{
    /// <summary>
    /// Advanced configuration for SkillBase SDK
    /// Only use this if you need custom settings
    /// </summary>
    public class SkillBaseConfig
    {
        /// <summary>
        /// Base URL for API (defaults based on environment)
        /// </summary>
        public string BaseUrl { get; set; }

        /// <summary>
        /// Maximum retry attempts (default: 3)
        /// </summary>
        public int MaxRetries { get; set; } = 3;

        /// <summary>
        /// Retry delay in milliseconds (default: 1000)
        /// </summary>
        public int RetryDelayMs { get; set; } = 1000;

        /// <summary>
        /// Custom token storage implementation (optional)
        /// </summary>
        public ISkillBaseTokenStorage CustomTokenStorage { get; set; }

        /// <summary>
        /// Create default configuration for environment
        /// </summary>
        public static SkillBaseConfig Default(Environment environment)
        {
            return new SkillBaseConfig
            {
                BaseUrl = environment == Environment.Development
                    ? "http://localhost:3000"
                    : "https://api.skillbase.com",
                MaxRetries = 3,
                RetryDelayMs = 1000
            };
        }
    }

    /// <summary>
    /// Interface for custom token storage (advanced users)
    /// </summary>
    public interface ISkillBaseTokenStorage
    {
        void SaveToken(string token);
        string LoadToken();
        void ClearToken();
    }
}

