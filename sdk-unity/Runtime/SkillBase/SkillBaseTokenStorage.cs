using UnityEngine;

namespace SkillBase
{
    /// <summary>
    /// Internal: Handles token storage automatically
    /// Uses PlayerPrefs by default, can be replaced with secure storage
    /// </summary>
    internal class SkillBaseTokenStorage : ISkillBaseTokenStorage
    {
        private const string TOKEN_KEY = "skillbase_jwt_token";

        public void SaveToken(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                ClearToken();
                return;
            }

            PlayerPrefs.SetString(TOKEN_KEY, token);
            PlayerPrefs.Save();
        }

        public string LoadToken()
        {
            return PlayerPrefs.GetString(TOKEN_KEY, null);
        }

        public void ClearToken()
        {
            PlayerPrefs.DeleteKey(TOKEN_KEY);
            PlayerPrefs.Save();
        }
    }
}

