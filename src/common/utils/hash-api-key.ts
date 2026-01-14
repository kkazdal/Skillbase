import * as bcrypt from 'bcrypt';

/**
 * Hash an API key using bcrypt (same as password hashing)
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, 10);
}

/**
 * Compare a plain API key with a hashed API key
 */
export async function compareApiKey(
  plainApiKey: string,
  hashedApiKey: string,
): Promise<boolean> {
  return bcrypt.compare(plainApiKey, hashedApiKey);
}

