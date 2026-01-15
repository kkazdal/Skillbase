/**
 * SkillBase SDK - Mobile-Ready Example
 *
 * This example demonstrates mobile-ready features:
 * - Automatic retry with exponential backoff
 * - Token refresh handling
 * - Network error recovery
 * - Token persistence
 */

import { SkillBaseClient, SkillBaseError } from '../src/index';

// Mobile storage simulation (use AsyncStorage, SecureStorage, etc. in real apps)
class MobileStorage {
  private static storage: Map<string, string> = new Map();

  static async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
    // In real app: await AsyncStorage.setItem(key, value);
  }

  static async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
    // In real app: return await AsyncStorage.getItem(key);
  }

  static async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
    // In real app: await AsyncStorage.removeItem(key);
  }
}

async function mobileReadyExample() {
  // Initialize client with mobile-ready options
  const client = new SkillBaseClient({
    baseUrl: 'https://api.skillbase.com',
    maxRetries: 3, // Retry up to 3 times
    retryDelay: 1000, // Start with 1 second delay
    autoRefreshToken: true, // Enable automatic token refresh
    onTokenRefresh: async (newToken) => {
      // Save token to secure storage
      await MobileStorage.setItem('jwt_token', newToken);
      console.log('✅ Token refreshed and saved');
    },
  });

  // Load saved token if exists
  const savedToken = await MobileStorage.getItem('jwt_token');
  if (savedToken) {
    client.setJwt(savedToken);
    console.log('✅ Loaded saved token');
  }

  try {
    // 1. Login with automatic retry
    console.log('🔐 Logging in...');
    const auth = await client.login('user@example.com', 'password123');
    console.log('✅ Logged in:', auth.user.id);

    // 2. Create event with automatic retry on network errors
    console.log('\n📊 Creating event...');
    const event = await client.createEvent(
      auth.user.id,
      'level_completed',
      150,
      {
        level: 5,
        score: 1000,
        timestamp: Date.now(),
      },
    );
    console.log('✅ Event created:', event.id);

    // 3. Get events with retry
    console.log('\n📥 Getting events...');
    const events = await client.getEvents(auth.user.id);
    console.log(`✅ Found ${events.length} events`);

    // 4. Manual token refresh (before expiration)
    console.log('\n🔄 Refreshing token...');
    try {
      const refreshed = await client.refreshToken();
      console.log('✅ Token refreshed:', refreshed.accessToken.substring(0, 20) + '...');
    } catch (error) {
      console.log('⚠️ Token refresh failed, will auto-refresh on next request');
    }
  } catch (error) {
    if (error instanceof SkillBaseError) {
      console.error('❌ Error:', error.message);
      console.error('   Status Code:', error.statusCode);

      if (error.statusCode === 401) {
        // Token expired, clear saved token
        await MobileStorage.removeItem('jwt_token');
        console.log('⚠️ Token expired, please login again');
      } else if (error.statusCode === 0) {
        // Network error
        console.log('⚠️ Network error - request will be retried automatically');
      }
    } else {
      console.error('❌ Unknown error:', error);
    }
  }
}

// React Native / Expo example
async function reactNativeExample() {
  // Import AsyncStorage in React Native
  // import AsyncStorage from '@react-native-async-storage/async-storage';

  const client = new SkillBaseClient({
    baseUrl: 'https://api.skillbase.com',
    maxRetries: 3,
    retryDelay: 1000,
    autoRefreshToken: true,
    onTokenRefresh: async (newToken) => {
      // await AsyncStorage.setItem('jwt_token', newToken);
      console.log('Token saved to AsyncStorage');
    },
  });

  // Load token
  // const savedToken = await AsyncStorage.getItem('jwt_token');
  // if (savedToken) client.setJwt(savedToken);

  // Use client...
}

// Flutter / Dart example (conceptual)
/*
class SkillBaseMobileClient {
  Future<void> login(String email, String password) async {
    try {
      final auth = await client.login(email, password);
      // Save to secure storage
      await SecureStorage.write(key: 'jwt_token', value: auth.accessToken);
    } catch (e) {
      // Handle error
    }
  }
}
*/

export { mobileReadyExample, reactNativeExample };

