import { renderHook } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useSession } from "next-auth/react"
import { useAuth } from "../use-auth"

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}))

const mockUseSession = vi.mocked(useSession)

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns loading state when session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it("returns authenticated state when user is logged in", () => {
    const mockUser = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
    }

    const mockSession = {
      user: mockUser,
      expires: "2024-01-01",
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
  })

  it("returns unauthenticated state when user is not logged in", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
    expect(result.current.session).toBeNull()
  })
})