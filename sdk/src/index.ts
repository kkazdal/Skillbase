/**
 * SkillBase Full SDK
 *
 * A client library for interacting with the SkillBase API.
 * Supports Auth, Project, and Event APIs.
 * Works in both Node.js and browser environments.
 *
 * @packageDocumentation
 */

export { SkillBaseClient } from './client';
export type {
  Event,
  CreateEventResponse,
  SkillBaseClientOptions,
  User,
  Project,
  AuthResponse,
  CreateProjectResponse,
} from './types';
export { SkillBaseError } from './types';

// Default export for convenience
export { SkillBaseClient as default } from './client';

