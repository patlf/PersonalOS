import { prisma } from '../prisma'
import type { User, Task } from '@prisma/client'

export type UserWithTasks = User & {
  tasks: Task[]
}

export type CreateUserData = {
  email: string
  name: string
  avatarUrl?: string
  preferences?: Record<string, any>
}

export type UpdateUserData = Partial<Omit<CreateUserData, 'email'>>

export class UserRepository {
  static async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data
    })
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  static async findWithTasks(id: string): Promise<UserWithTasks | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    })
  }

  static async updatePreferences(
    id: string, 
    preferences: Record<string, any>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { preferences }
    })
  }

  static async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id }
    })
  }

  static async exists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    return !!user
  }
}