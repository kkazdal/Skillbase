using System;
using System.Collections.Generic;
using UnityEngine;

namespace SkillBase
{
    /// <summary>
    /// Events API for SkillBase
    /// Track game events and analytics
    /// </summary>
    public class SkillBaseEvents
    {
        private readonly SkillBaseClientWrapper _client;

        internal SkillBaseEvents(SkillBaseClientWrapper client)
        {
            _client = client;
        }

        /// <summary>
        /// Track an event
        /// </summary>
        /// <param name="name">Event name (e.g., "level_completed", "purchase")</param>
        /// <param name="value">Numeric value (optional)</param>
        /// <param name="metadata">Additional metadata dictionary (optional)</param>
        /// <param name="onSuccess">Callback on success</param>
        /// <param name="onError">Callback on error</param>
        public void Track(
            string name,
            double? value = null,
            Dictionary<string, object> metadata = null,
            Action<Event> onSuccess = null,
            Action<SkillBaseError> onError = null)
        {
            // Use current user ID if authenticated, otherwise require userId in metadata
            string userId = SkillBaseSDK.CurrentUser?.id;
            
            if (string.IsNullOrEmpty(userId))
            {
                Debug.LogWarning("SkillBase: No authenticated user. Event will be tracked anonymously.");
                // Could allow anonymous tracking, but for now require auth
                onError?.Invoke(new SkillBaseError("User must be authenticated to track events", 401));
                return;
            }

            _client.CreateEvent(
                userId,
                name,
                value,
                metadata,
                (evt) =>
                {
                    onSuccess?.Invoke(evt);
                },
                (error) =>
                {
                    Debug.LogError($"SkillBase Track failed: {error.Message}");
                    onError?.Invoke(error);
                }
            );
        }

        /// <summary>
        /// Get events for current user
        /// </summary>
        /// <param name="onSuccess">Callback with events array</param>
        /// <param name="onError">Callback on error</param>
        public void Get(
            Action<Event[]> onSuccess = null,
            Action<SkillBaseError> onError = null)
        {
            string userId = SkillBaseSDK.CurrentUser?.id;
            
            if (string.IsNullOrEmpty(userId))
            {
                onError?.Invoke(new SkillBaseError("User must be authenticated to get events", 401));
                return;
            }

            Get(userId, onSuccess, onError);
        }

        /// <summary>
        /// Get events for a specific user (requires API key or admin access)
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="onSuccess">Callback with events array</param>
        /// <param name="onError">Callback on error</param>
        public void Get(
            string userId,
            Action<Event[]> onSuccess = null,
            Action<SkillBaseError> onError = null)
        {
            _client.GetEvents(
                userId,
                (events) =>
                {
                    onSuccess?.Invoke(events);
                },
                (error) =>
                {
                    Debug.LogError($"SkillBase GetEvents failed: {error.Message}");
                    onError?.Invoke(error);
                }
            );
        }
    }
}

