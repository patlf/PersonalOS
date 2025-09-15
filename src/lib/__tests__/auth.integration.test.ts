import { describe, it, expect, beforeEach, vi } from "vitest"
import { authOptions } from "../auth"
import { prisma } from "../prisma"

// Mock Prisma
vi.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe("Auth Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should have correct auth configuration", () => {
    expect(authOptions).toBeDefined()
    expect(authOptions.providers).toHaveLength(2)
    expect(authOptions.providers[0].id).toBe("google")
    expect(authOptions.providers[1].id).toBe("credentials")
    expect(authOptions.session?.strategy).toBe("jwt")
  })

  it("should have correct callback URLs configured", () => {
    expect(authOptions.pages?.signIn).toBe("/auth/signin")
    expect(authOptions.pages?.error).toBe("/auth/error")
  })

  it("should handle session callback correctly", async () => {
    const mockSession = {
      user: { id: "123", name: "Test User", email: "test@example.com" },
      expires: "2024-01-01",
    }
    
    const mockToken = {
      sub: "123",
      uid: "123",
    }

    const result = await authOptions.callbacks?.session?.({
      session: mockSession,
      token: mockToken,
    })

    expect(result?.user?.id).toBe("123")
  })

  it("should handle jwt callback correctly", async () => {
    const mockUser = {
      id: "123",
      name: "Test User",
      email: "test@example.com",
    }

    const mockToken = {}

    const result = await authOptions.callbacks?.jwt?.({
      user: mockUser,
      token: mockToken,
    })

    expect(result?.uid).toBe("123")
  })
})