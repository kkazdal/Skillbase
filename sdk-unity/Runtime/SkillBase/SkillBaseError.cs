using System;

namespace SkillBase
{
    /// <summary>
    /// Custom exception class for SkillBase SDK errors
    /// </summary>
    public class SkillBaseError : Exception
    {
        public int? StatusCode { get; }
        public object Response { get; }

        public SkillBaseError(string message, int? statusCode = null, object response = null)
            : base(message)
        {
            StatusCode = statusCode;
            Response = response;
        }

        public SkillBaseError(string message, Exception innerException, int? statusCode = null)
            : base(message, innerException)
        {
            StatusCode = statusCode;
        }
    }
}

