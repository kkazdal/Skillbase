import { randomBytes } from 'crypto';

export type ApiKeyEnvironment = 'live' | 'test';

export interface ApiKeyParts {
  keyId: string;
  secret: string;
  fullKey: string;
  environment: ApiKeyEnvironment;
}

/**
 * Generate API key with Stripe/Supabase-style format:
 * skb_<env>_<keyId>_<secret>
 * 
 * Supported environments:
 * - 'live': Production environment
 * - 'test': Testing/development environment
 * 
 * - keyId: Short, indexed identifier (8 bytes = 16 hex chars)
 * - secret: Long, secret part (32 bytes = 64 hex chars)
 * - fullKey: Complete API key string
 */
export function generateApiKey(environment: ApiKeyEnvironment = 'live'): ApiKeyParts {
  const keyId = randomBytes(8).toString('hex'); // 16 chars - indexed
  const secret = randomBytes(32).toString('hex'); // 64 chars - secret
  
  return {
    keyId,
    secret,
    environment,
    fullKey: `skb_${environment}_${keyId}_${secret}`,
  };
}

