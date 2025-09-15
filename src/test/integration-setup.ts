import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Create a global test Prisma client
let testPrisma: PrismaClient;

// Helper function to clean database using raw SQL to avoid prepared statement issues
async function cleanDatabase() {
  try {
    // Use raw SQL to avoid prepared statement cache issues
    await testPrisma.$executeRaw`TRUNCATE TABLE "tasks" RESTART IDENTITY CASCADE`;
    await testPrisma.$executeRaw`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`;
  } catch (error) {
    console.warn('TRUNCATE failed, falling back to DELETE:', error);
    // Fallback to DELETE if TRUNCATE fails
    await testPrisma.$executeRaw`DELETE FROM "tasks"`;
    await testPrisma.$executeRaw`DELETE FROM "users"`;
  }
}

// Setup for integration tests that require database
beforeAll(async () => {
  try {
    // Create a fresh Prisma client for tests
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    await testPrisma.$connect();
    console.log('✅ Database connected for integration tests');
    
    // Clean up any existing test data
    await cleanDatabase();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    if (testPrisma) {
      // Final cleanup
      await cleanDatabase();
      await testPrisma.$disconnect();
      console.log('✅ Database disconnected after integration tests');
    }
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
  }
});

// Export the test Prisma client and cleanup function for use in tests
export { testPrisma, cleanDatabase };