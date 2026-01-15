/**
 * SkillBase Full SDK - TypeScript Types
 */

/**
 * Event object returned from the API
 */
export interface Event {
  /** Unique event identifier (UUID) */
  id: string;
  /** Project ID that owns this event */
  projectId: string;
  /** User ID associated with this event (optional) */
  userId?: string | null;
  /** Event name/type */
  name: string;
  /** Numeric value associated with the event (optional) */
  value?: number | null;
  /** Additional metadata as JSON object (optional) */
  metadata?: Record<string, any> | null;
  /** Event creation timestamp (ISO 8601) */
  createdAt: string;
}

/**
 * Response from createEvent API
 */
export interface CreateEventResponse {
  /** Whether the event was created successfully */
  success: boolean;
  /** The ID of the created event */
  eventId: string;
}

/**
 * User object returned from the API
 */
export interface User {
  /** Unique user identifier (UUID) */
  id: string;
  /** User email address */
  email: string;
  /** User name (optional) */
  name?: string | null;
  /** User creation timestamp (ISO 8601) */
  createdAt: string;
}

/**
 * Project object returned from the API
 */
export interface Project {
  /** Unique project identifier (UUID) */
  id: string;
  /** Project name */
  name: string;
  /** API key for the project (only returned on creation/regeneration) */
  apiKey?: string;
  /** Project environment (live or test) */
  environment: 'live' | 'test';
  /** User ID that owns this project */
  userId: string;
  /** Project creation timestamp (ISO 8601) */
  createdAt: string;
}

/**
 * Auth response from register/login
 */
export interface AuthResponse {
  /** User object */
  user: User;
  /** JWT access token */
  accessToken: string;
}

/**
 * Project creation response
 */
export interface CreateProjectResponse {
  /** Created project object */
  project: Project;
  /** API key (only shown once during creation) */
  apiKey: string;
}

/**
 * SDK configuration options
 */
export interface SkillBaseClientOptions {
  /** API Key for authentication (project-specific, optional if jwt provided) */
  apiKey?: string;
  /** JWT token for user authentication (optional if apiKey provided) */
  jwt?: string;
  /** Base URL for the API (optional, defaults to http://localhost:3000) */
  baseUrl?: string;
  /** Maximum number of retry attempts for failed requests (default: 3) */
  maxRetries?: number;
  /** Retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Enable automatic token refresh (default: true) */
  autoRefreshToken?: boolean;
  /** Callback for token refresh (optional) */
  onTokenRefresh?: (newToken: string) => void;
}

/**
 * Custom error class for SDK errors
 */
export class SkillBaseError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
  ) {
    super(message);
    this.name = 'SkillBaseError';
    Object.setPrototypeOf(this, SkillBaseError.prototype);
  }
}

