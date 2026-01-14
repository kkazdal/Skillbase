/**
 * SkillBase SDK - API Key Usage Example
 *
 * This example demonstrates using the SDK with an API key
 * (for Event API only, after you have an API key from project creation)
 */

import { SkillBaseClient } from '../src/index';

async function main() {
  // Initialize client with API key
  const client = new SkillBaseClient({
    apiKey: 'skb_live_your_api_key_here', // Replace with your actual API key
    baseUrl: 'http://localhost:3000',
  });

  try {
    // Track events
    console.log('Tracking events with API key...');

    const event1 = await client.createEvent(
      'user_123',
      'level_completed',
      150,
      {
        level: 5,
        score: 1000,
        difficulty: 'hard',
      },
    );
    console.log('✅ Event 1 created:', event1.id);

    const event2 = await client.createEvent('user_123', 'purchase', 9.99, {
      item: 'premium_pack',
      currency: 'USD',
    });
    console.log('✅ Event 2 created:', event2.id);

    // List events
    const events = await client.getEvents('user_123');
    console.log(`\n✅ Found ${events.length} events for user_123`);

    events.forEach((e) => {
      console.log(`   - ${e.name}: ${e.value} at ${e.createdAt}`);
    });

    // List all events (no userId filter)
    const allEvents = await client.getEvents();
    console.log(`\n✅ Total events in project: ${allEvents.length}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.statusCode === 401) {
      console.error('   Invalid API key. Please check your API key.');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main };

