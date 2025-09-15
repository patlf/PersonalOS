import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useSession, signOut } from "next-auth/react"
import { UserProfile } from "../user-profile"

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

const mockUseSession = vi.mocked(useSession)
const mockSignOut = vi.mocked(signOut)

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing when user is not authenticated", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    })

    const { container } = render(<UserProfile />)
    expect(container.firstChild).toBeNull()
  })

  it("renders user profile when authenticated", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          image: "https://example.com/avatar.jpg",
        },
      },
      status: "authenticated",
    })

    render(<UserProfile />)
    
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("john@example.com")).toBeInTheDocument()
  })

  it("shows user initials when no image is provided", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          image: null,
        },
      },
      status: "authenticated",
    })

    render(<UserProfile />)
    
    expect(screen.getByText("JD")).toBeInTheDocument()
  })

  it("calls signOut when sign out is clicked", async () => {
    const user = userEvent.setup()
    
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
        },
      },
      status: "authenticated",
    })

    render(<UserProfile />)
    
    // Click the profile button to open dropdown
    const profileButton = screen.getByRole("button")
    await user.click(profileButton)
    
    // Click sign out
    const signOutButton = screen.getByText("Sign out")
    await user.click(signOutButton)
    
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/auth/signin" })
  })

  it("renders collapsed version when collapsed prop is true", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
        },
      },
      status: "authenticated",
    })

    render(<UserProfile collapsed={true} />)
    
    // In collapsed mode, name and email should not be visible
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument()
    expect(screen.queryByText("john@example.com")).not.toBeInTheDocument()
  })
})