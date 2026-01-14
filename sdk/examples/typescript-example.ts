/**
 * SkillBase Event SDK - TypeScript Example
 *
 * This example demonstrates TypeScript usage with full type safety.
 */

import { SkillBaseClient, SkillBaseError, Event } from '../src/index';

async function main() {
  // Initialize client with type safety
  const client = new SkillBaseClient({
    apiKey: process.env.SKILLBASE_API_KEY || 'skb_live_your_api_key_here',
    baseUrl: process.env.SKILLBASE_BASE_URL || 'http://localhost:3000/v1',
  });

  try {
    // Create event with full type checking
    const event: Event = await client.createEvent(
      'user_123',
      'level_completed',
      150,
      {
        level: 5,
        score: 1000,
        difficulty: 'hard' as const,
      },
    );

    console.log('Event created:', event);
    console.log('Event ID:', event.id);
    console.log('Event name:', event.name);
    console.log('Event value:', event.value);
    console.log('Event metadata:', event.metadata);

    // Get events with type safety
    const events: Event[] = await client.getEvents('user_123');
    console.log(`\nFound ${events.length} events for user_123`);

    // Type-safe event processing
    const levelCompletions = events.filter(
      (e: Event) => e.name === 'level_completed',
    );
    const totalScore = levelCompletions.reduce(
      (sum: number, e: Event) => sum + (e.value || 0),
      0,
    );

    console.log(`Total score: ${totalScore}`);
    console.log(`Levels completed: ${levelCompletions.length}`);

    // Get all events
    const allEvents: Event[] = await client.getEvents();
    console.log(`\nTotal events in project: ${allEvents.length}`);
  } catch (error) {
    // Type-safe error handling
    if (error instanceof SkillBaseError) {
      console.error('SkillBase Error:', error.message);
      console.error('Status Code:', error.statusCode);
      if (error.response) {
        console.error('Response:', error.response);
      }
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main };

