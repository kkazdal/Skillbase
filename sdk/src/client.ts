/**
 * SkillBase Full SDK - Client Implementation
 * Supports Auth, Project, and Event APIs
 * Mobile-ready with retry mechanism and token refresh
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
 * Mobile-ready with automatic retry and token refresh
 */
export class SkillBaseClient {
  private apiKey?: string;
  private jwt?: string;
  private baseUrl: string;
  private apiBaseUrl: string;
  private maxRetries: number;
  private retryDelay: number;
  private autoRefreshToken: boolean;
  private onTokenRefresh?: (newToken: string) => void;

  /**
   * Creates a new SkillBase client instance
   *
   * @param options - Client configuration options
   * @example
   * ```typescript
   * // Mobile-ready with retry and auto token refresh
   * const client = new SkillBaseClient({
   *   jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   *   baseUrl: 'https://api.skillbase.com',
   *   maxRetries: 3,
   *   retryDelay: 1000,
   *   autoRefreshToken: true,
   *   onTokenRefresh: (newToken) => {
   *     // Save token to secure storage
   *     SecureStorage.set('jwt', newToken);
   *   }
   * });
   * ```
   */
  constructor(options: SkillBaseClientOptions) {
    // Allow initialization without auth for register/login
    if (!options.apiKey && !options.jwt && options.baseUrl) {
      // This is OK - user will login/register first
    } else if (!options.apiKey && !options.jwt) {
      throw new Error('Either apiKey or jwt must be provided');
    }

    this.apiKey = options.apiKey;
    this.jwt = options.jwt;
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.apiBaseUrl = `${this.baseUrl}/v1`;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.autoRefreshToken = options.autoRefreshToken ?? true;
    this.onTokenRefresh = options.onTokenRefresh;
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
    if (this.onTokenRefresh) {
      this.onTokenRefresh(jwt);
    }
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
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Checks if error is retryable
   */
  private isRetryableError(error: SkillBaseError): boolean {
    // Retry on network errors (statusCode 0) or 5xx server errors
    if (error.statusCode === 0 || (error.statusCode && error.statusCode >= 500)) {
      return true;
    }
    // Retry on 401 if we have JWT (might need token refresh)
    if (error.statusCode === 401 && this.jwt && this.autoRefreshToken) {
      return true;
    }
    return false;
  }

  /**
   * Internal method to refresh the JWT token
   */
  private async refreshTokenInternal(): Promise<void> {
    if (!this.jwt) {
      throw new Error('No JWT token to refresh');
    }

    try {
      const response = await this.request<AuthResponse>(
        `${this.baseUrl}/auth/refresh`,
        {
          method: 'POST',
          body: JSON.stringify({ token: this.jwt }),
        },
        false, // Don't retry token refresh
      );

      if (response.accessToken) {
        this.setJwt(response.accessToken);
      }
    } catch (error) {
      // If refresh fails, clear JWT
      this.clearJwt();
      throw error;
    }
  }

  /**
   * Makes an HTTP request with retry mechanism and error handling
   * Mobile-ready with automatic token refresh
   */
  private async request<T>(
    url: string,
    options: RequestInit = {},
    retryOnAuth = true,
    requireAuth = true,
  ): Promise<T> {
    let lastError: SkillBaseError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Try token refresh if we got 401 and have auto-refresh enabled
        if (
          attempt > 0 &&
          lastError?.statusCode === 401 &&
          this.jwt &&
          this.autoRefreshToken &&
          retryOnAuth
        ) {
          try {
            await this.refreshTokenInternal();
          } catch (refreshError) {
            // If refresh fails, throw original error
            throw lastError;
          }
        }

        // Build headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        };

        // Add auth header if not already present and auth is required
        if (requireAuth && !headers.Authorization && !headers.authorization) {
          try {
            headers.Authorization = this.getAuthHeader();
          } catch (error) {
            // If auth is required but not available, throw error
            throw new SkillBaseError(
              'No authentication method available',
              401,
              error,
            );
          }
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          const error = new SkillBaseError(
            data.message || `HTTP ${response.status}`,
            response.status,
            data,
          );

          // If it's a retryable error and we have retries left, continue
          if (
            this.isRetryableError(error) &&
            attempt < this.maxRetries &&
            retryOnAuth
          ) {
            lastError = error;
            // Exponential backoff: delay * 2^attempt
            await this.sleep(this.retryDelay * Math.pow(2, attempt));
            continue;
          }

          throw error;
        }

        return data as T;
      } catch (error) {
        if (error instanceof SkillBaseError) {
          lastError = error;

          // If it's a retryable error and we have retries left, continue
          if (
            this.isRetryableError(error) &&
            attempt < this.maxRetries &&
            retryOnAuth
          ) {
            // Exponential backoff: delay * 2^attempt
            await this.sleep(this.retryDelay * Math.pow(2, attempt));
            continue;
          }

          throw error;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = new SkillBaseError(
            'Network error: Unable to connect to the API',
            0,
            error,
          );

          // Retry network errors
          if (attempt < this.maxRetries) {
            await this.sleep(this.retryDelay * Math.pow(2, attempt));
            continue;
          }

          throw lastError;
        }

        throw new SkillBaseError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          0,
          error,
        );
      }
    }

    // If we exhausted all retries, throw last error
    throw lastError || new SkillBaseError('Request failed after retries', 0);
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
    const response = await this.request<AuthResponse>(
      `${this.baseUrl}/auth/register`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      },
      false, // Don't retry registration
      false, // Don't require auth for registration
    );

    // Automatically set JWT after registration
    if (response.accessToken) {
      this.setJwt(response.accessToken);
    }

    return response;
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
   * // JWT is automatically set
   * ```
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      `${this.baseUrl}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false, // Don't retry login
      false, // Don't require auth for login
    );

    // Automatically set JWT after login
    if (response.accessToken) {
      this.setJwt(response.accessToken);
    }

    return response;
  }

  /**
   * Refreshes the current JWT token
   * Mobile-friendly: Allows apps to refresh tokens before expiration
   *
   * @returns Promise resolving to auth response with new token
   * @throws {SkillBaseError} If the request fails
   *
   * @example
   * ```typescript
   * try {
   *   const auth = await client.refreshToken();
   *   console.log('Token refreshed:', auth.accessToken);
   * } catch (error) {
   *   // Token expired or invalid, need to login again
   *   await client.login(email, password);
   * }
   * ```
   */
  async refreshToken(): Promise<AuthResponse> {
    if (!this.jwt) {
      throw new SkillBaseError('No JWT token to refresh', 401);
    }

    const response = await this.request<AuthResponse>(
      `${this.baseUrl}/auth/refresh`,
      {
        method: 'POST',
        body: JSON.stringify({ token: this.jwt }),
      },
      false, // Don't retry token refresh
    );

    // Automatically update JWT
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
   * // API key is automatically set
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
   * // New API key is automatically set
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
   * Mobile-ready with automatic retry on network errors
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
   * Mobile-ready with automatic retry on network errors
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
