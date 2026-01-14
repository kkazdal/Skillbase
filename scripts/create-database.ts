import { Client } from 'pg';
import { config } from 'dotenv';

config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres', // Connect to default postgres database first
};

const dbName = process.env.DB_DATABASE || 'skillbase';

async function createDatabase() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length > 0) {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    } else {
      // Create database
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully`);
    }
  } catch (error: any) {
    if (error.code === '3D000') {
      console.error(`❌ Database "${dbName}" does not exist and could not be created`);
    } else if (error.code === '42P04') {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    } else {
      console.error('❌ Error:', error.message);
      console.error('\n💡 Make sure:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. Credentials in .env are correct');
      console.error('   3. User has permission to create databases');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();

