/**
 * SkillBase Full SDK - Complete Workflow Example
 *
 * This example demonstrates the complete workflow:
 * 1. Register user
 * 2. Login
 * 3. Create project (get API key)
 * 4. Track events
 * 5. List events
 */

import { SkillBaseClient } from '../src/index';

async function main() {
  // Initialize client (no auth needed for register)
  const client = new SkillBaseClient({
    baseUrl: 'http://localhost:3000',
  });

  try {
    // 1. Register a new user
    console.log('1️⃣ Registering user...');
    const registerResponse = await client.register(
      `test_${Date.now()}@example.com`,
      'password123',
      'Test User',
    );
    console.log('✅ User registered:', registerResponse.user.id);
    console.log('   Email:', registerResponse.user.email);

    // JWT is automatically set after register, but let's set it explicitly
    client.setJwt(registerResponse.accessToken);
    console.log('✅ JWT token set');

    // 2. Login (alternative to register)
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await client.login(
      registerResponse.user.email,
      'password123',
    );
    console.log('✅ Logged in:', loginResponse.user.id);
    // JWT is automatically set after login

    // 3. Create a project
    console.log('\n3️⃣ Creating project...');
    const projectResponse = await client.createProject('My Awesome Game');
    console.log('✅ Project created:', projectResponse.project.id);
    console.log('   Project name:', projectResponse.project.name);
    console.log('   API Key:', projectResponse.apiKey.substring(0, 30) + '...');
    // API key is automatically set after project creation

    // 4. List all projects
    console.log('\n4️⃣ Listing projects...');
    const projects = await client.listProjects();
    console.log(`✅ Found ${projects.length} project(s)`);
    projects.forEach((p) => {
      console.log(`   - ${p.name} (${p.id})`);
    });

    // 5. Get a specific project
    console.log('\n5️⃣ Getting project details...');
    const project = await client.getProject(projectResponse.project.id);
    console.log('✅ Project details:', project.name);

    // 6. Track events using API key
    console.log('\n6️⃣ Tracking events...');
    const event1 = await client.createEvent(
      registerResponse.user.id,
      'level_completed',
      150,
      {
        level: 1,
        score: 1000,
        timeSpent: 120,
      },
    );
    console.log('✅ Event 1 created:', event1.id);

    const event2 = await client.createEvent(
      registerResponse.user.id,
      'achievement_unlocked',
      1,
      {
        achievement: 'first_win',
        timestamp: Date.now(),
      },
    );
    console.log('✅ Event 2 created:', event2.id);

    // 7. List events
    console.log('\n7️⃣ Listing events...');
    const allEvents = await client.getEvents();
    console.log(`✅ Found ${allEvents.length} total event(s)`);

    const userEvents = await client.getEvents(registerResponse.user.id);
    console.log(`✅ Found ${userEvents.length} event(s) for user`);

    userEvents.forEach((e) => {
      console.log(`   - ${e.name}: ${e.value} at ${e.createdAt}`);
    });

    // 8. Regenerate API key (optional)
    console.log('\n8️⃣ Regenerating API key...');
    const { apiKey: newApiKey } = await client.regenerateApiKey(
      projectResponse.project.id,
    );
    console.log('✅ New API key:', newApiKey.substring(0, 30) + '...');
    // New API key is automatically set

    // 9. Logout (clear JWT)
    console.log('\n9️⃣ Logging out...');
    client.logout();
    console.log('✅ Logged out (JWT cleared)');

    console.log('\n✨ Complete workflow finished successfully!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.statusCode) {
      console.error('   Status Code:', error.statusCode);
    }
    if (error.response) {
      console.error('   Response:', error.response);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main };

