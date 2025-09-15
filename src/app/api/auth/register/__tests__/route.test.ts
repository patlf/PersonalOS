import { POST } from '../route'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock password utilities
jest.mock('@/lib/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedPassword123'),
  validatePassword: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'TestPassword123',
    }

    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('User created successfully')
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(userData.email)
  })

  it('should return error if user already exists', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'TestPassword123',
    }

    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'john@example.com',
    } as any)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('User with this email already exists')
  })

  it('should return error for missing fields', async () => {
    const userData = {
      name: 'John Doe',
      // missing email and password
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name, email, and password are required')
  })

  it('should return error for invalid email format', async () => {
    const userData = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'TestPassword123',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })
})