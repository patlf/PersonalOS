import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      preferences: {
        theme: 'light',
        timezone: 'UTC'
      }
    }
  })

  // Create sample tasks
  const tasks = [
    {
      title: 'Review project requirements',
      description: 'Go through the productivity platform requirements document',
      estimatedDuration: 60,
      status: 'someday',
      tags: ['work', 'planning'],
      priority: 'high'
    },
    {
      title: 'Design database schema',
      description: 'Create the initial database schema for tasks and users',
      estimatedDuration: 90,
      status: 'completed',
      tags: ['development', 'database'],
      priority: 'high'
    },
    {
      title: 'Implement drag and drop',
      description: 'Add drag and drop functionality for task management',
      estimatedDuration: 120,
      status: 'someday',
      tags: ['development', 'ui'],
      priority: 'medium'
    },
    {
      title: 'Write unit tests',
      description: 'Create comprehensive unit tests for task components',
      estimatedDuration: 180,
      status: 'someday',
      tags: ['testing', 'development'],
      priority: 'medium'
    },
    {
      title: 'Team standup meeting',
      description: 'Daily standup with the development team',
      estimatedDuration: 30,
      status: 'scheduled',
      scheduledDate: new Date(),
      scheduledTime: new Date('2024-01-01T09:00:00Z'),
      tags: ['meeting', 'team'],
      priority: 'low'
    }
  ]

  for (const taskData of tasks) {
    await prisma.task.upsert({
      where: { 
        id: `${user.id}-${taskData.title.toLowerCase().replace(/\s+/g, '-')}` 
      },
      update: {},
      create: {
        ...taskData,
        userId: user.id
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })