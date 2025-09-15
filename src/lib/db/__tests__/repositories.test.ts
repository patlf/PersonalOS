import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TaskRepository } from '../tasks'
import { UserRepository } from '../users'
import { prisma } from '../../prisma'

describe('Repository Classes', () => {
  let testUserId: string

  beforeEach(async () => {
    // Clean up and create test user
    await prisma.task.deleteMany()
    await prisma.user.deleteMany()
    
    const user = await UserRepository.create({
      email: 'repo-test@example.com',
      name: 'Repository Test User',
      preferences: { theme: 'light' }
    })
    testUserId = user.id
  })

  afterEach(async () => {
    // Clean up after each test
    await prisma.task.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('UserRepository', () => {
    it('should create and find user by email', async () => {
      const userData = {
        email: 'new-repo-user@example.com',
        name: 'New Repository User',
        preferences: { theme: 'dark' }
      }

      const user = await UserRepository.create(userData)
      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)

      const foundUser = await UserRepository.findByEmail(userData.email)
      expect(foundUser?.id).toBe(user.id)
    })

    it('should check if user exists', async () => {
      const exists = await UserRepository.exists('repo-test@example.com')
      expect(exists).toBe(true)

      const notExists = await UserRepository.exists('nonexistent@example.com')
      expect(notExists).toBe(false)
    })

    it('should update user preferences', async () => {
      const newPreferences = { theme: 'dark', timezone: 'UTC' }
      
      const updatedUser = await UserRepository.updatePreferences(testUserId, newPreferences)
      expect(updatedUser.preferences).toEqual(newPreferences)
    })
  })

  describe('TaskRepository', () => {
    it('should create and find task by id', async () => {
      const taskData = {
        title: 'Repository Test Task',
        description: 'Testing repository methods',
        estimatedDuration: 90,
        userId: testUserId
      }

      const task = await TaskRepository.create(taskData)
      expect(task.title).toBe(taskData.title)
      expect(task.userId).toBe(testUserId)

      const foundTask = await TaskRepository.findById(task.id)
      expect(foundTask?.id).toBe(task.id)
    })

    it('should find tasks by user id', async () => {
      await TaskRepository.create({
        title: 'Task 1',
        userId: testUserId
      })
      await TaskRepository.create({
        title: 'Task 2',
        userId: testUserId
      })

      const tasks = await TaskRepository.findByUserId(testUserId)
      expect(tasks).toHaveLength(2)
    })

    it('should find tasks by status', async () => {
      await TaskRepository.create({
        title: 'Someday Task',
        status: 'someday',
        userId: testUserId
      })
      await TaskRepository.create({
        title: 'Scheduled Task',
        status: 'scheduled',
        userId: testUserId
      })

      const somedayTasks = await TaskRepository.findByStatus(testUserId, 'someday')
      expect(somedayTasks).toHaveLength(1)
      expect(somedayTasks[0].title).toBe('Someday Task')
    })

    it('should find overdue tasks', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0) // Ensure it's at start of day

      await TaskRepository.create({
        title: 'Overdue Task',
        status: 'scheduled',
        scheduledDate: yesterday,
        userId: testUserId
      })

      const overdueTasks = await TaskRepository.findOverdue(testUserId)
      expect(overdueTasks).toHaveLength(1)
      expect(overdueTasks[0].title).toBe('Overdue Task')
    })

    it('should count tasks by status', async () => {
      await TaskRepository.create({
        title: 'Someday Task 1',
        status: 'someday',
        userId: testUserId
      })
      await TaskRepository.create({
        title: 'Someday Task 2',
        status: 'someday',
        userId: testUserId
      })
      await TaskRepository.create({
        title: 'Completed Task',
        status: 'completed',
        userId: testUserId
      })

      const counts = await TaskRepository.countByStatus(testUserId)
      expect(counts.someday).toBe(2)
      expect(counts.completed).toBe(1)
    })

    it('should update task', async () => {
      const task = await TaskRepository.create({
        title: 'Task to Update',
        userId: testUserId
      })

      const updatedTask = await TaskRepository.update(task.id, {
        title: 'Updated Task',
        status: 'completed'
      })

      expect(updatedTask.title).toBe('Updated Task')
      expect(updatedTask.status).toBe('completed')
    })
  })
})