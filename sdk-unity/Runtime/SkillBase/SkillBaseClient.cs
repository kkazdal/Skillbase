using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace SkillBase
{
    /// <summary>
    /// SkillBase Client for Unity
    /// Mobile-ready with automatic retry and token refresh
    /// </summary>
    public class SkillBaseClient
    {
        private string apiKey;
        private string jwt;
        private string baseUrl;
        private string apiBaseUrl;
        private int maxRetries;
        private int retryDelayMs;
        private bool autoRefreshToken;
        private Action<string> onTokenRefresh;

        /// <summary>
        /// Creates a new SkillBase client instance
        /// </summary>
        public SkillBaseClient(SkillBaseClientOptions options)
        {
            if (string.IsNullOrEmpty(options.apiKey) && string.IsNullOrEmpty(options.jwt) && string.IsNullOrEmpty(options.baseUrl))
            {
                throw new ArgumentException("Either apiKey or jwt must be provided");
            }

            this.apiKey = options.apiKey;
            this.jwt = options.jwt;
            this.baseUrl = options.baseUrl ?? "http://localhost:3000";
            this.apiBaseUrl = $"{this.baseUrl}/v1";
            this.maxRetries = options.maxRetries;
            this.retryDelayMs = options.retryDelayMs;
            this.autoRefreshToken = options.autoRefreshToken;
            this.onTokenRefresh = options.onTokenRefresh;
        }

        /// <summary>
        /// Parses JSON response (handles arrays and objects)
        /// </summary>
        private T ParseJson<T>(string json)
        {
            // Handle Event arrays specifically
            if (typeof(T) == typeof(EventArray))
            {
                string wrappedJson = $"{{\"items\":{json}}}";
                var wrapper = JsonUtility.FromJson<EventArray>(wrappedJson);
                return (T)(object)wrapper;
            }

            // Handle regular objects
            return JsonUtility.FromJson<T>(json);
        }

        /// <summary>
        /// Gets the appropriate authorization header
        /// </summary>
        private string GetAuthHeader()
        {
            if (!string.IsNullOrEmpty(apiKey))
            {
                return $"Bearer {apiKey}";
            }
            if (!string.IsNullOrEmpty(jwt))
            {
                return $"Bearer {jwt}";
            }
            throw new SkillBaseError("No authentication method available");
        }

        /// <summary>
        /// Sets the JWT token
        /// </summary>
        public void SetJwt(string token)
        {
            this.jwt = token;
            onTokenRefresh?.Invoke(token);
        }

        /// <summary>
        /// Sets the API key
        /// </summary>
        public void SetApiKey(string key)
        {
            this.apiKey = key;
        }

        /// <summary>
        /// Clears the JWT token (logout)
        /// </summary>
        public void ClearJwt()
        {
            this.jwt = null;
        }

        /// <summary>
        /// Checks if error is retryable
        /// </summary>
        private bool IsRetryableError(SkillBaseError error)
        {
            // Retry on network errors (statusCode 0) or 5xx server errors
            if (error.StatusCode == null || error.StatusCode == 0 || (error.StatusCode >= 500))
            {
                return true;
            }
            // Retry on 401 if we have JWT (might need token refresh)
            if (error.StatusCode == 401 && !string.IsNullOrEmpty(jwt) && autoRefreshToken)
            {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Makes an HTTP request with retry mechanism
        /// </summary>
        private IEnumerator Request<T>(
            MonoBehaviour coroutineRunner,
            string url,
            string method,
            string body,
            Dictionary<string, string> headers,
            bool retryOnAuth,
            Action<T> onSuccess,
            Action<SkillBaseError> onError)
        {
            SkillBaseError lastError = null;

            for (int attempt = 0; attempt <= maxRetries; attempt++)
            {
                // Try token refresh if we got 401 and have auto-refresh enabled
                if (attempt > 0 && lastError?.StatusCode == 401 && !string.IsNullOrEmpty(jwt) && autoRefreshToken && retryOnAuth)
                {
                    yield return coroutineRunner.StartCoroutine(RefreshTokenCoroutine(coroutineRunner, (success) =>
                    {
                        if (!success)
                        {
                            onError?.Invoke(lastError);
                        }
                    }));
                }

                UnityWebRequest request = null;
                bool requestSuccess = false;
                string errorMessage = null;
                int statusCode = 0;
                bool requestCreated = false;
                Exception createException = null;

                try
                {
                    request = new UnityWebRequest(url, method);

                    // Set headers
                    if (headers != null)
                    {
                        foreach (var header in headers)
                        {
                            request.SetRequestHeader(header.Key, header.Value);
                        }
                    }

                    // Add auth header if not already present
                    if (!headers?.ContainsKey("Authorization") ?? true)
                    {
                        request.SetRequestHeader("Authorization", GetAuthHeader());
                    }

                    request.SetRequestHeader("Content-Type", "application/json");

                    // Set upload/download handlers
                    if (!string.IsNullOrEmpty(body))
                    {
                        byte[] bodyRaw = Encoding.UTF8.GetBytes(body);
                        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                    }
                    request.downloadHandler = new DownloadHandlerBuffer();
                    requestCreated = true;
                }
                catch (Exception ex)
                {
                    createException = ex;
                    lastError = new SkillBaseError($"Network error: {ex.Message}", ex, 0);
                }

                // Handle request creation error (retry if possible)
                if (!requestCreated && createException != null)
                {
                    if (attempt < maxRetries)
                    {
                        yield return new WaitForSeconds(retryDelayMs * Mathf.Pow(2, attempt) / 1000f);
                        continue;
                    }
                    else
                    {
                        break;
                    }
                }

                if (request != null)
                {
                    yield return request.SendWebRequest();

                    requestSuccess = request.result == UnityWebRequest.Result.Success;
                    statusCode = (int)request.responseCode;
                    errorMessage = request.downloadHandler?.text;

                    if (requestSuccess)
                    {
                        try
                        {
                            T data = ParseJson<T>(request.downloadHandler.text);
                            request.Dispose();
                            onSuccess?.Invoke(data);
                            yield break;
                        }
                        catch (Exception ex)
                        {
                            lastError = new SkillBaseError($"Failed to parse response: {ex.Message}", statusCode);
                            request.Dispose();
                        }
                    }
                    else
                    {
                        try
                        {
                            if (!string.IsNullOrEmpty(errorMessage))
                            {
                                var errorData = JsonUtility.FromJson<Dictionary<string, object>>(errorMessage);
                                errorMessage = errorData.ContainsKey("message") ? errorData["message"].ToString() : errorMessage;
                            }
                        }
                        catch { }

                        lastError = new SkillBaseError(errorMessage ?? $"HTTP {statusCode}", statusCode);
                        request.Dispose();

                        // If it's a retryable error and we have retries left, continue
                        if (IsRetryableError(lastError) && attempt < maxRetries && retryOnAuth)
                        {
                            // Exponential backoff
                            yield return new WaitForSeconds(retryDelayMs * Mathf.Pow(2, attempt) / 1000f);
                            continue;
                        }
                    }
                }
            }

            // If we exhausted all retries, call error callback
            onError?.Invoke(lastError ?? new SkillBaseError("Request failed after retries", 0));
        }

        // ============================================================================
        // AUTH METHODS
        // ============================================================================

        /// <summary>
        /// Registers a new user
        /// </summary>
        public void Register(MonoBehaviour coroutineRunner, string email, string password, string name, Action<AuthResponse> onSuccess, Action<SkillBaseError> onError)
        {
            var body = JsonUtility.ToJson(new { email, password, name });
            var headers = new Dictionary<string, string>();

            coroutineRunner.StartCoroutine(Request<AuthResponse>(
                coroutineRunner,
                $"{baseUrl}/auth/register",
                "POST",
                body,
                headers,
                false, // Don't retry registration
                (response) =>
                {
                    if (response.accessToken != null)
                    {
                        SetJwt(response.accessToken);
                    }
                    onSuccess?.Invoke(response);
                },
                onError
            ));
        }

        /// <summary>
        /// Logs in a user
        /// </summary>
        public void Login(MonoBehaviour coroutineRunner, string email, string password, Action<AuthResponse> onSuccess, Action<SkillBaseError> onError)
        {
            var body = JsonUtility.ToJson(new { email, password });
            var headers = new Dictionary<string, string>();

            coroutineRunner.StartCoroutine(Request<AuthResponse>(
                coroutineRunner,
                $"{baseUrl}/auth/login",
                "POST",
                body,
                headers,
                false, // Don't retry login
                (response) =>
                {
                    if (response.accessToken != null)
                    {
                        SetJwt(response.accessToken);
                    }
                    onSuccess?.Invoke(response);
                },
                onError
            ));
        }

        /// <summary>
        /// Refreshes the current JWT token
        /// </summary>
        private IEnumerator RefreshTokenCoroutine(MonoBehaviour coroutineRunner, Action<bool> onComplete)
        {
            if (string.IsNullOrEmpty(jwt))
            {
                onComplete?.Invoke(false);
                yield break;
            }

            bool success = false;
            var body = JsonUtility.ToJson(new { token = jwt });

            yield return Request<AuthResponse>(
                coroutineRunner,
                $"{baseUrl}/auth/refresh",
                "POST",
                body,
                null,
                false, // Don't retry token refresh
                (response) =>
                {
                    if (response.accessToken != null)
                    {
                        SetJwt(response.accessToken);
                        success = true;
                    }
                },
                (error) =>
                {
                    ClearJwt();
                    success = false;
                }
            );

            onComplete?.Invoke(success);
        }

        /// <summary>
        /// Refreshes the current JWT token (public method)
        /// </summary>
        public void RefreshToken(MonoBehaviour coroutineRunner, Action<AuthResponse> onSuccess, Action<SkillBaseError> onError)
        {
            if (string.IsNullOrEmpty(jwt))
            {
                onError?.Invoke(new SkillBaseError("No JWT token to refresh", 401));
                return;
            }

            var body = JsonUtility.ToJson(new { token = jwt });

            coroutineRunner.StartCoroutine(Request<AuthResponse>(
                coroutineRunner,
                $"{baseUrl}/auth/refresh",
                "POST",
                body,
                null,
                false,
                (response) =>
                {
                    if (response.accessToken != null)
                    {
                        SetJwt(response.accessToken);
                    }
                    onSuccess?.Invoke(response);
                },
                (error) =>
                {
                    ClearJwt();
                    onError?.Invoke(error);
                }
            ));
        }

        /// <summary>
        /// Logs out the current user
        /// </summary>
        public void Logout()
        {
            ClearJwt();
        }

        // ============================================================================
        // EVENT METHODS
        // ============================================================================

        /// <summary>
        /// Creates a new event
        /// Mobile-ready with automatic retry on network errors
        /// </summary>
        public void CreateEvent(
            MonoBehaviour coroutineRunner,
            string userId,
            string name,
            double? value,
            Dictionary<string, object> metadata,
            Action<Event> onSuccess,
            Action<SkillBaseError> onError)
        {
            // Create JSON manually for metadata dictionary
            string metadataJson = "null";
            if (metadata != null && metadata.Count > 0)
            {
                var metadataParts = new List<string>();
                foreach (var kvp in metadata)
                {
                    string valueStr = kvp.Value is string ? $"\"{kvp.Value}\"" : kvp.Value?.ToString() ?? "null";
                    metadataParts.Add($"\"{kvp.Key}\":{valueStr}");
                }
                metadataJson = "{" + string.Join(",", metadataParts) + "}";
            }

            string valueStr2 = value.HasValue ? value.Value.ToString() : "null";
            string body = $"{{\"userId\":\"{userId}\",\"event\":\"{name}\",\"value\":{valueStr2},\"meta\":{metadataJson}}}";

            var headers = new Dictionary<string, string>
            {
                { "Authorization", GetAuthHeader() }
            };

            coroutineRunner.StartCoroutine(Request<CreateEventResponse>(
                coroutineRunner,
                $"{apiBaseUrl}/events",
                "POST",
                body,
                headers,
                true, // Retry on auth errors
                (response) =>
                {
                    // Return minimal event object immediately
                    // (fetching full event would require another request)
                    onSuccess?.Invoke(new Event
                    {
                        id = response.eventId,
                        projectId = "",
                        userId = userId,
                        name = name,
                        value = value,
                        metadata = metadata,
                        createdAt = DateTime.UtcNow.ToString("o")
                    });
                },
                onError
            ));
        }

        /// <summary>
        /// Retrieves events, optionally filtered by userId
        /// Mobile-ready with automatic retry on network errors
        /// </summary>
        public void GetEvents(
            MonoBehaviour coroutineRunner,
            string userId,
            Action<Event[]> onSuccess,
            Action<SkillBaseError> onError)
        {
            string url = $"{apiBaseUrl}/events";
            if (!string.IsNullOrEmpty(userId))
            {
                url += $"?userId={UnityWebRequest.EscapeURL(userId)}";
            }

            var headers = new Dictionary<string, string>
            {
                { "Authorization", GetAuthHeader() }
            };

            coroutineRunner.StartCoroutine(Request<EventArray>(
                coroutineRunner,
                url,
                "GET",
                null,
                headers,
                true, // Retry on auth errors
                (wrapper) => onSuccess?.Invoke(wrapper.items),
                onError
            ));
        }
    }
}

