/**
 * SkillBase SDK - JWT Usage Example
 *
 * This example demonstrates using the SDK with JWT token
 * (for Auth and Project APIs)
 */

import { SkillBaseClient } from '../src/index';

async function main() {
  // Initialize client with JWT
  const client = new SkillBaseClient({
    jwt: 'your_jwt_token_here', // Replace with actual JWT from login
    baseUrl: 'http://localhost:3000',
  });

  try {
    // Create a project
    console.log('Creating project with JWT...');
    const project = await client.createProject('My Game Project', 'A fun game');
    console.log('✅ Project created:', project.project.id);
    console.log('   API Key:', project.apiKey.substring(0, 30) + '...');

    // List projects
    console.log('\nListing projects...');
    const projects = await client.listProjects();
    console.log(`✅ Found ${projects.length} project(s)`);

    // Get project details
    console.log('\nGetting project details...');
    const projectDetails = await client.getProject(project.project.id);
    console.log('✅ Project:', projectDetails.name);

    // Regenerate API key
    console.log('\nRegenerating API key...');
    const { apiKey: newApiKey } = await client.regenerateApiKey(
      project.project.id,
    );
    console.log('✅ New API key:', newApiKey.substring(0, 30) + '...');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.statusCode === 401) {
      console.error('   Invalid or expired JWT. Please login again.');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main };

