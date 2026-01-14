/**
 * SkillBase Event SDK - Error Handling Examples
 *
 * This example demonstrates how to handle errors when using the SDK.
 */

import { SkillBaseClient, SkillBaseError } from '@skillbase/event-sdk';

const client = new SkillBaseClient({
  apiKey: 'skb_live_your_api_key_here',
  baseUrl: 'http://localhost:3000/v1',
});

// Example 1: Basic error handling
async function basicErrorHandling() {
  try {
    const event = await client.createEvent('user_123', 'test_event');
    console.log('Success:', event);
  } catch (error) {
    if (error instanceof SkillBaseError) {
      console.error('SkillBase Error:', error.message);
      console.error('Status Code:', error.statusCode);
      console.error('Response:', error.response);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Example 2: Handling specific error types
async function specificErrorHandling() {
  try {
    const event = await client.createEvent('user_123', 'test_event');
    console.log('Success:', event);
  } catch (error) {
    if (error instanceof SkillBaseError) {
      switch (error.statusCode) {
        case 401:
          console.error('Authentication failed. Check your API key.');
          // Handle unauthorized error
          break;
        case 400:
          console.error('Invalid request:', error.response);
          // Handle validation errors
          break;
        case 0:
          console.error('Network error. Check your connection.');
          // Handle network errors
          break;
        default:
          console.error('API error:', error.message);
      }
    }
  }
}

// Example 3: Retry logic for network errors
async function createEventWithRetry(userId, name, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const event = await client.createEvent(userId, name);
      return event;
    } catch (error) {
      if (error instanceof SkillBaseError && error.statusCode === 0) {
        // Network error - retry
        if (attempt < maxRetries) {
          console.log(`Retry attempt ${attempt + 1}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
      // Other errors or max retries reached
      throw error;
    }
  }
}

// Example 4: Graceful degradation
async function trackEventSafely(userId, name, value, metadata) {
  try {
    await client.createEvent(userId, name, value, metadata);
  } catch (error) {
    // Log error but don't break the application
    console.error('Failed to track event:', error.message);
    
    // Optionally: Store events locally for later retry
    // saveEventLocally({ userId, name, value, metadata });
  }
}

// Example 5: Validation before API call
function validateEvent(userId, name) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId must be a non-empty string');
  }
  if (!name || typeof name !== 'string') {
    throw new Error('name must be a non-empty string');
  }
}

async function createEventWithValidation(userId, name, value, metadata) {
  try {
    validateEvent(userId, name);
    return await client.createEvent(userId, name, value, metadata);
  } catch (error) {
    if (error instanceof SkillBaseError) {
      // API error
      throw error;
    } else {
      // Validation error
      console.error('Validation error:', error.message);
      throw error;
    }
  }
}

export {
  basicErrorHandling,
  specificErrorHandling,
  createEventWithRetry,
  trackEventSafely,
  createEventWithValidation,
};

