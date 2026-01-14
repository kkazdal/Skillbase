/**
 * SkillBase Event SDK - TypeScript Types
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
 * SDK configuration options
 */
export interface SkillBaseClientOptions {
  /** API Key for authentication (required) */
  apiKey: string;
  /** Base URL for the API (optional, defaults to http://localhost:3000/v1) */
  baseUrl?: string;
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

