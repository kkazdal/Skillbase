/**
 * SkillBase Event SDK - Browser Example
 *
 * This example demonstrates how to use the SDK in a browser environment.
 * Include the SDK in your HTML or bundle it with your build tool.
 */

// If using a bundler (webpack, vite, etc.):
// import { SkillBaseClient } from '@skillbase/event-sdk';

// If using a CDN or global script:
// const { SkillBaseClient } = window.SkillBaseSDK;

async function trackGameEvent() {
  // Initialize the client with your API key
  const client = new SkillBaseClient({
    apiKey: 'skb_live_your_api_key_here',
    baseUrl: 'https://api.skillbase.com/v1', // Your production API URL
  });

  try {
    // Track a level completion event
    const event = await client.createEvent(
      getCurrentUserId(), // Your user ID
      'level_completed',
      getCurrentScore(), // Numeric value
      {
        level: getCurrentLevel(),
        timeSpent: getTimeSpent(),
        achievements: getAchievements(),
      },
    );

    console.log('Event tracked:', event.id);
    showNotification('Progress saved!');
  } catch (error) {
    console.error('Failed to track event:', error.message);
    // Handle error (show user message, retry, etc.)
  }
}

async function loadUserProgress() {
  const client = new SkillBaseClient({
    apiKey: 'skb_live_your_api_key_here',
    baseUrl: 'https://api.skillbase.com/v1',
  });

  try {
    const userId = getCurrentUserId();
    const events = await client.getEvents(userId);

    // Display user's progress
    const levelCompletions = events.filter((e) => e.name === 'level_completed');
    console.log(`User completed ${levelCompletions.length} levels`);

    // Render progress on page
    renderProgress(levelCompletions);
  } catch (error) {
    console.error('Failed to load progress:', error.message);
  }
}

// Example helper functions (implement based on your app)
function getCurrentUserId() {
  return localStorage.getItem('userId') || 'anonymous';
}

function getCurrentScore() {
  return parseInt(document.getElementById('score')?.textContent || '0');
}

function getCurrentLevel() {
  return parseInt(document.getElementById('level')?.textContent || '1');
}

function getTimeSpent() {
  return Date.now() - window.gameStartTime;
}

function getAchievements() {
  return ['first_win', 'speed_demon'];
}

function showNotification(message) {
  // Your notification implementation
  console.log('Notification:', message);
}

function renderProgress(events) {
  // Your rendering implementation
  console.log('Rendering progress for', events.length, 'events');
}

// Export for use in your application
if (typeof window !== 'undefined') {
  window.trackGameEvent = trackGameEvent;
  window.loadUserProgress = loadUserProgress;
}

