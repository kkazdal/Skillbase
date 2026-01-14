/**
 * SkillBase Full SDK - Client Implementation
 * Supports Auth, Project, and Event APIs
 */

import type {
  Event,
  CreateEventResponse,
  SkillBaseClientOptions,
  Project,
  AuthResponse,
  CreateProjectResponse,
} from './types';
import { SkillBaseError } from './types';

/**
 * SkillBase Client for interacting with all SkillBase APIs
 */
export class SkillBaseClient {
  private apiKey?: string;
  private jwt?: string;
  private baseUrl: string;
  private apiBaseUrl: string;

  /**
   * Creates a new SkillBase client instance
   *
   * @param options - Client configuration options
   * @example
   * ```typescript
   * // With API Key (for Event API)
   * const client = new SkillBaseClient({
   *   apiKey: 'skb_live_xxx_yyy',
   *   baseUrl: 'https://api.skillbase.com'
   * });
   *
   * // With JWT (for Auth and Project APIs)
   * const client = new SkillBaseClient({
   *   jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   *   baseUrl: 'https://api.skillbase.com'
   * });
   * ```
   */
  constructor(options: SkillBaseClientOptions) {
    if (!options.apiKey && !options.jwt) {
      throw new Error('Either apiKey or jwt must be provided');
    }

    this.apiKey = options.apiKey;
    this.jwt = options.jwt;
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.apiBaseUrl = `${this.baseUrl}/v1`;
  }

  /**
   * Gets the appropriate authorization header
   * Prioritizes API key over JWT
   */
  private getAuthHeader(): string {
    if (this.apiKey) {
      return `Bearer ${this.apiKey}`;
    }
    if (this.jwt) {
      return `Bearer ${this.jwt}`;
    }
    throw new Error('No authentication method available');
  }

  /**
   * Sets the JWT token (useful after login)
   */
  setJwt(jwt: string): void {
    this.jwt = jwt;
  }

  /**
   * Sets the API key (useful after project creation)
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Clears the JWT token (logout)
   */
  clearJwt(): void {
    this.jwt = undefined;
  }

  /**
   * Makes an HTTP request with error handling
   */
  private async request<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
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

      return data as T;
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

  // ============================================================================
  // AUTH METHODS
  // ============================================================================

  /**
   * Registers a new user
   *
   * @param email - User email address
   * @param password - User password (min 6 characters)
   * @param name - Optional user name
   * @returns Promise resolving to auth response with user and JWT token
   * @throws {SkillBaseError} If the request fails
   *
   * @example
   * ```typescript
   * const auth = await client.register('user@example.com', 'password123', 'John Doe');
   * client.setJwt(auth.accessToken); // Set JWT for subsequent requests
   * ```
   */
  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  /**
   * Logs in a user
   *
   * @param email - User email address
   * @param password - User password
   * @returns Promise resolving to auth response with user and JWT token
   * @throws {SkillBaseError} If the request fails
   *
   * @example
   * ```typescript
   * const auth = await client.login('user@example.com', 'password123');
   * client.setJwt(auth.accessToken); // Set JWT for subsequent requests
   * ```
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      `${this.baseUrl}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );

    // Automatically set JWT after login
    if (response.accessToken) {
      this.setJwt(response.accessToken);
    }

    return response;
  }

  /**
   * Logs out the current user (clears JWT token)
   *
   * @example
   * ```typescript
   * client.logout();
   * ```
   */
  logout(): void {
    this.clearJwt();
  }

  // ============================================================================
  // PROJECT METHODS
  // ============================================================================

  /**
   * Creates a new project
   *
   * @param name - Project name
   * @param description - Optional project description
   * @returns Promise resolving to project and API key
   * @throws {SkillBaseError} If the request fails (requires JWT)
   *
   * @example
   * ```typescript
   * const result = await client.createProject('My Game', 'A fun game project');
   * client.setApiKey(result.apiKey); // Set API key for Event API
   * ```
   */
  async createProject(
    name: string,
    description?: string,
  ): Promise<CreateProjectResponse> {
    const response = await this.request<CreateProjectResponse>(
      `${this.baseUrl}/projects`,
      {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify({ name, description }),
      },
    );

    // Automatically set API key if returned
    if (response.apiKey) {
      this.setApiKey(response.apiKey);
    }

    return response;
  }

  /**
   * Lists all projects for the current user
   *
   * @returns Promise resolving to an array of projects
   * @throws {SkillBaseError} If the request fails (requires JWT)
   *
   * @example
   * ```typescript
   * const projects = await client.listProjects();
   * console.log(`You have ${projects.length} projects`);
   * ```
   */
  async listProjects(): Promise<Project[]> {
    return this.request<Project[]>(`${this.baseUrl}/projects`, {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });
  }

  /**
   * Gets a project by ID
   *
   * @param id - Project ID
   * @returns Promise resolving to the project
   * @throws {SkillBaseError} If the request fails (requires JWT)
   *
   * @example
   * ```typescript
   * const project = await client.getProject('project-id-here');
   * console.log(project.name);
   * ```
   */
  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`${this.baseUrl}/projects/${id}`, {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });
  }

  /**
   * Regenerates the API key for a project
   *
   * @param projectId - Project ID
   * @returns Promise resolving to the new API key
   * @throws {SkillBaseError} If the request fails (requires JWT)
   *
   * @example
   * ```typescript
   * const { apiKey } = await client.regenerateApiKey('project-id-here');
   * client.setApiKey(apiKey); // Update client with new API key
   * ```
   */
  async regenerateApiKey(projectId: string): Promise<{ apiKey: string }> {
    const response = await this.request<{ apiKey: string }>(
      `${this.baseUrl}/projects/${projectId}/regenerate-api-key`,
      {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
      },
    );

    // Automatically update API key if regenerated
    if (response.apiKey) {
      this.setApiKey(response.apiKey);
    }

    return response;
  }

  // ============================================================================
  // EVENT METHODS
  // ============================================================================

  /**
   * Creates a new event
   *
   * @param userId - User ID associated with the event
   * @param name - Event name/type
   * @param value - Optional numeric value
   * @param metadata - Optional metadata object
   * @returns Promise resolving to the created event
   * @throws {SkillBaseError} If the request fails (requires API key or JWT)
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
    const response = await this.request<CreateEventResponse>(
      `${this.apiBaseUrl}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify({
          userId,
          event: name,
          value,
          meta: metadata,
        }),
      },
    );

    // Try to fetch the created event to return full Event object
    try {
      const events = await this.getEvents(userId);
      const createdEvent = events.find((e) => e.id === response.eventId);
      if (createdEvent) {
        return createdEvent;
      }
    } catch (error) {
      // If getEvents fails, continue with minimal event object
    }

    // Return minimal event object with available data
    return {
      id: response.eventId,
      projectId: '', // Will be populated by API on next fetch
      userId,
      name,
      value: value ?? null,
      metadata: metadata ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves events, optionally filtered by userId
   *
   * @param userId - Optional user ID to filter events
   * @returns Promise resolving to an array of events
   * @throws {SkillBaseError} If the request fails (requires API key or JWT)
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
    const url = new URL(`${this.apiBaseUrl}/events`);
    if (userId) {
      url.searchParams.set('userId', userId);
    }

    return this.request<Event[]>(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });
  }
}
