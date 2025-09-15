import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { testPrisma as prisma, cleanDatabase } from '@/test/integration-setup'

describe('Database Integration Tests', () => {
  let testUserId: string

  beforeEach(async () => {
    // Clean up and create test user
    try {
      await cleanDatabase()
      
      const user = await prisma.user.create({
        data: {
          email: 'test-integration@example.com',
          name: 'Test Integration User',
          preferences: { theme: 'light' }
        }
      })
      testUserId = user.id
    } catch (error) {
      console.error('Setup failed:', error)
      throw error
    }
  })

  afterEach(async () => {
    // Clean up after each test
    try {
      await cleanDatabase()
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  })

  describe('User Operations', () => {
    it('should create a user with default preferences', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'new-user@example.com',
          name: 'New User'
        }
      })

      expect(user.email).toBe('new-user@example.com')
      expect(user.name).toBe('New User')
      expect(user.preferences).toEqual({})
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should enforce unique email constraint', async () => {
      await prisma.user.create({
        data: {
          email: 'duplicate@example.com',
          name: 'First User'
        }
      })

      await expect(
        prisma.user.create({
          data: {
            email: 'duplicate@example.com',
            name: 'Second User'
          }
        })
      ).rejects.toThrow()
    })

    it('should update user preferences', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'prefs@example.com',
          name: 'Prefs User'
        }
      })

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          preferences: {
            theme: 'dark',
            timezone: 'America/New_York'
          }
        }
      })

      expect(updatedUser.preferences).toEqual({
        theme: 'dark',
        timezone: 'America/New_York'
      })
    })
  })

  describe('Task Operations', () => {
    it('should create a task with default values', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          userId: testUserId
        }
      })

      expect(task.title).toBe('Test Task')
      expect(task.userId).toBe(testUserId)
      expect(task.estimatedDuration).toBe(60)
      expect(task.status).toBe('someday')
      expect(task.priority).toBe('medium')
      expect(task.tags).toEqual([])
      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.updatedAt).toBeInstanceOf(Date)
    })

    it('should create a task with all fields', async () => {
      const scheduledDate = new Date('2024-01-15')
      const scheduledTime = new Date('1970-01-01T14:30:00Z') // Time fields store only time portion

      const task = await prisma.task.create({
        data: {
          title: 'Complete Task',
          description: 'A comprehensive test task',
          estimatedDuration: 120,
          status: 'scheduled',
          scheduledDate,
          scheduledTime,
          tags: ['work', 'important'],
          priority: 'high',
          userId: testUserId
        }
      })

      expect(task.title).toBe('Complete Task')
      expect(task.description).toBe('A comprehensive test task')
      expect(task.estimatedDuration).toBe(120)
      expect(task.status).toBe('scheduled')
      expect(task.scheduledDate).toEqual(scheduledDate)
      expect(task.scheduledTime).toEqual(scheduledTime)
      expect(task.tags).toEqual(['work', 'important'])
      expect(task.priority).toBe('high')
    })

    it('should update task status and scheduling', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Update',
          userId: testUserId
        }
      })

      const scheduledDate = new Date('2024-01-20')
      const scheduledTime = new Date('1970-01-01T10:00:00Z') // Time fields store only time portion

      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: {
          status: 'scheduled',
          scheduledDate,
          scheduledTime,
          priority: 'high'
        }
      })

      expect(updatedTask.status).toBe('scheduled')
      expect(updatedTask.scheduledDate).toEqual(scheduledDate)
      expect(updatedTask.scheduledTime).toEqual(scheduledTime)
      expect(updatedTask.priority).toBe('high')
    })

    it('should delete task when user is deleted (cascade)', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to be deleted',
          userId: testUserId
        }
      })

      await prisma.user.delete({
        where: { id: testUserId }
      })

      const deletedTask = await prisma.task.findUnique({
        where: { id: task.id }
      })

      expect(deletedTask).toBeNull()
    })

    it('should find tasks by user with relations', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', userId: testUserId, status: 'someday' },
          { title: 'Task 2', userId: testUserId, status: 'scheduled' },
          { title: 'Task 3', userId: testUserId, status: 'completed' }
        ]
      })

      const userWithTasks = await prisma.user.findUnique({
        where: { id: testUserId },
        include: {
          tasks: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      expect(userWithTasks?.tasks).toHaveLength(3)
      expect(userWithTasks?.tasks[0].title).toBe('Task 1')
      expect(userWithTasks?.tasks[1].title).toBe('Task 2')
      expect(userWithTasks?.tasks[2].title).toBe('Task 3')
    })

    it('should filter tasks by status', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Someday Task', userId: testUserId, status: 'someday' },
          { title: 'Scheduled Task', userId: testUserId, status: 'scheduled' },
          { title: 'Completed Task', userId: testUserId, status: 'completed' }
        ]
      })

      const scheduledTasks = await prisma.task.findMany({
        where: {
          userId: testUserId,
          status: 'scheduled'
        }
      })

      expect(scheduledTasks).toHaveLength(1)
      expect(scheduledTasks[0].title).toBe('Scheduled Task')
    })

    it('should filter tasks by date range', async () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfter = new Date(today)
      dayAfter.setDate(dayAfter.getDate() + 2)

      await prisma.task.createMany({
        data: [
          { title: 'Today Task', userId: testUserId, scheduledDate: today },
          { title: 'Tomorrow Task', userId: testUserId, scheduledDate: tomorrow },
          { title: 'Day After Task', userId: testUserId, scheduledDate: dayAfter }
        ]
      })

      const tasksInRange = await prisma.task.findMany({
        where: {
          userId: testUserId,
          scheduledDate: {
            gte: today,
            lte: tomorrow
          }
        },
        orderBy: { scheduledDate: 'asc' }
      })

      expect(tasksInRange).toHaveLength(2)
      expect(tasksInRange[0].title).toBe('Today Task')
      expect(tasksInRange[1].title).toBe('Tomorrow Task')
    })
  })

  describe('Data Validation', () => {
    it('should enforce title length constraint', async () => {
      const longTitle = 'a'.repeat(501) // Exceeds 500 character limit

      await expect(
        prisma.task.create({
          data: {
            title: longTitle,
            userId: testUserId
          }
        })
      ).rejects.toThrow()
    })

    it('should handle empty tags array', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task with empty tags',
          userId: testUserId,
          tags: []
        }
      })

      expect(task.tags).toEqual([])
    })

    it('should handle multiple tags', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task with multiple tags',
          userId: testUserId,
          tags: ['work', 'urgent', 'meeting', 'client']
        }
      })

      expect(task.tags).toEqual(['work', 'urgent', 'meeting', 'client'])
    })
  })
})