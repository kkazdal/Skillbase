/**
 * SkillBase Event SDK - Client Implementation
 */

import type {
  Event,
  CreateEventResponse,
  SkillBaseClientOptions,
} from './types';
import { SkillBaseError } from './types';

/**
 * SkillBase Client for interacting with the Event API
 */
export class SkillBaseClient {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates a new SkillBase client instance
   *
   * @param options - Client configuration options
   * @example
   * ```typescript
   * const client = new SkillBaseClient({
   *   apiKey: 'skb_live_xxx_yyy',
   *   baseUrl: 'https://api.skillbase.com/v1' // optional
   * });
   * ```
   */
  constructor(options: SkillBaseClientOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'http://localhost:3000/v1';
  }

  /**
   * Creates a new event
   *
   * @param userId - User ID associated with the event
   * @param name - Event name/type
   * @param value - Optional numeric value
   * @param metadata - Optional metadata object
   * @returns Promise resolving to the created event
   * @throws {SkillBaseError} If the request fails
   *
   * @example
   * ```typescript
   * const event = await client.createEvent(
   *   'user_123',
   *   'level_completed',
   *   150,
   *   { level: 5, score: 1000 }
   * );
   * ```
   */
  async createEvent(
    userId: string,
    name: string,
    value?: number,
    metadata?: Record<string, any>,
  ): Promise<Event> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          userId,
          event: name,
          value,
          meta: metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new SkillBaseError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data,
        );
      }

      const createResponse = data as CreateEventResponse;

      // Try to fetch the created event to return full Event object
      // If it fails or event not found, return a minimal event object
      try {
        const events = await this.getEvents(userId);
        const createdEvent = events.find((e) => e.id === createResponse.eventId);
        if (createdEvent) {
          return createdEvent;
        }
      } catch (error) {
        // If getEvents fails, continue with minimal event object
      }

      // Return minimal event object with available data
      return {
        id: createResponse.eventId,
        projectId: '', // Will be populated by API on next fetch
        userId,
        name,
        value: value ?? null,
        metadata: metadata ?? null,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof SkillBaseError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new SkillBaseError(
          'Network error: Unable to connect to the API',
          0,
          error,
        );
      }

      throw new SkillBaseError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        error,
      );
    }
  }

  /**
   * Retrieves events, optionally filtered by userId
   *
   * @param userId - Optional user ID to filter events
   * @returns Promise resolving to an array of events
   * @throws {SkillBaseError} If the request fails
   *
   * @example
   * ```typescript
   * // Get all events for the project
   * const allEvents = await client.getEvents();
   *
   * // Get events for a specific user
   * const userEvents = await client.getEvents('user_123');
   * ```
   */
  async getEvents(userId?: string): Promise<Event[]> {
    try {
      const url = new URL(`${this.baseUrl}/events`);
      if (userId) {
        url.searchParams.set('userId', userId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new SkillBaseError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data,
        );
      }

      return data as Event[];
    } catch (error) {
      if (error instanceof SkillBaseError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new SkillBaseError(
          'Network error: Unable to connect to the API',
          0,
          error,
        );
      }

      throw new SkillBaseError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        error,
      );
    }
  }
}

