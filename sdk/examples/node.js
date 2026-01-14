/**
 * SkillBase Event SDK - Node.js Example
 *
 * This example demonstrates how to use the SDK in a Node.js environment.
 * Make sure to install the SDK first: npm install @skillbase/event-sdk
 */

const { SkillBaseClient } = require('@skillbase/event-sdk');
// Or with ES modules:
// import { SkillBaseClient } from '@skillbase/event-sdk';

async function main() {
  // Initialize the client with your API key
  const client = new SkillBaseClient({
    apiKey: 'skb_live_your_api_key_here',
    baseUrl: 'http://localhost:3000/v1', // Optional, defaults to localhost
  });

  try {
    // Create an event
    console.log('Creating event...');
    const event = await client.createEvent(
      'user_123',
      'level_completed',
      150,
      {
        level: 5,
        score: 1000,
        difficulty: 'hard',
      },
    );

    console.log('Event created:', event);
    console.log('Event ID:', event.id);

    // Get events for a specific user
    console.log('\nFetching events for user_123...');
    const userEvents = await client.getEvents('user_123');
    console.log(`Found ${userEvents.length} events`);
    userEvents.forEach((e) => {
      console.log(`- ${e.name} (value: ${e.value}) at ${e.createdAt}`);
    });

    // Get all events for the project
    console.log('\nFetching all events...');
    const allEvents = await client.getEvents();
    console.log(`Total events: ${allEvents.length}`);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.statusCode) {
      console.error('HTTP Status:', error.statusCode);
    }
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

// Run the example
if (require.main === module) {
  main();
}

module.exports = { main };

