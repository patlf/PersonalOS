import { prisma } from '../prisma'
import type { Task, User } from '@prisma/client'

export type TaskWithUser = Task & {
  user: User
}

export type CreateTaskData = {
  title: string
  description?: string
  estimatedDuration?: number
  status?: string
  scheduledDate?: Date
  scheduledTime?: Date
  tags?: string[]
  priority?: string
  userId: string
}

export type UpdateTaskData = Partial<Omit<CreateTaskData, 'userId'>>

export class TaskRepository {
  static async create(data: CreateTaskData): Promise<Task> {
    return prisma.task.create({
      data
    })
  }

  static async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id }
    })
  }

  static async findByUserId(userId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }  // Changed to match WeeklyTimeline sorting
    })
  }

  static async findByStatus(userId: string, status: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { 
        userId,
        status 
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async findByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { scheduledDate: 'asc' }
    })
  }

  static async update(id: string, data: UpdateTaskData): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data
    })
  }

  static async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id }
    })
  }

  static async findOverdue(userId: string): Promise<Task[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return prisma.task.findMany({
      where: {
        userId,
        status: 'scheduled',
        scheduledDate: {
          lt: today
        }
      },
      orderBy: { scheduledDate: 'asc' }
    })
  }

  static async countByStatus(userId: string): Promise<Record<string, number>> {
    const counts = await prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true
      }
    })

    return counts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)
  }
}