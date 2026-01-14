/**
 * SkillBase Event SDK
 *
 * A client library for interacting with the SkillBase Event API.
 * Supports both Node.js and browser environments.
 *
 * @packageDocumentation
 */

export { SkillBaseClient } from './client';
export type {
  Event,
  CreateEventResponse,
  SkillBaseClientOptions,
} from './types';
export { SkillBaseError } from './types';

// Default export for convenience
export { SkillBaseClient as default } from './client';

