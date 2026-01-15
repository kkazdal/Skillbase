using System;
using System.Collections.Generic;
using UnityEngine;

namespace SkillBase
{
    /// <summary>
    /// Projects API for SkillBase
    /// Manage projects and API keys
    /// </summary>
    public class SkillBaseProjects
    {
        private readonly SkillBaseClientWrapper _client;

        internal SkillBaseProjects(SkillBaseClientWrapper client)
        {
            _client = client;
        }

        /// <summary>
        /// Create a new project
        /// Requires authentication
        /// </summary>
        /// <param name="name">Project name</param>
        /// <param name="description">Project description (optional)</param>
        /// <param name="onSuccess">Callback with project and API key</param>
        /// <param name="onError">Callback on error</param>
        public void Create(
            string name,
            string description = null,
            Action<Project, string> onSuccess = null,
            Action<SkillBaseError> onError = null)
        {
            if (!SkillBase.IsAuthenticated)
            {
                onError?.Invoke(new SkillBaseError("User must be authenticated to create projects", 401));
                return;
            }

            _client.CreateProject(
                name,
                description,
                (response) =>
                {
                    onSuccess?.Invoke(response.project, response.apiKey);
                },
                (error) =>
                {
                    Debug.LogError($"SkillBase CreateProject failed: {error.Message}");
                    onError?.Invoke(error);
                }
            );
        }

        /// <summary>
        /// List all projects for current user
        /// Requires authentication
        /// </summary>
        /// <param name="onSuccess">Callback with projects array</param>
        /// <param name="onError">Callback on error</param>
        public void List(
            Action<Project[]> onSuccess = null,
            Action<SkillBaseError> onError = null)
        {
            if (!SkillBase.IsAuthenticated)
            {
                onError?.Invoke(new SkillBaseError("User must be authenticated to list projects", 401));
                return;
            }

            _client.ListProjects(
                (projects) =>
                {
                    onSuccess?.Invoke(projects);
                },
                (error) =>
                {
                    Debug.LogError($"SkillBase ListProjects failed: {error.Message}");
                    onError?.Invoke(error);
                }
            );
        }
    }
}

