import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';

// Setup for integration tests that require database
beforeAll(async () => {
  // Ensure test database is clean
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database before each test
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterEach(async () => {
  // Clean up database after each test
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});