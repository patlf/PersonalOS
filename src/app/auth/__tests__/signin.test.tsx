import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { signIn, getProviders } from "next-auth/react"
import SignIn from "../signin/page"

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  getProviders: vi.fn(),
}))

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}))

const mockSignIn = vi.mocked(signIn)
const mockGetProviders = vi.mocked(getProviders)

describe("SignIn Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading spinner while providers are loading", () => {
    mockGetProviders.mockReturnValue(Promise.resolve(null))

    render(<SignIn />)
    
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders sign in form with email/password and OAuth providers", async () => {
    const mockProviders = {
      credentials: {
        id: "credentials",
        name: "credentials",
        type: "credentials",
      },
      google: {
        id: "google",
        name: "Google",
        type: "oauth",
        signinUrl: "/api/auth/signin/google",
        callbackUrl: "/api/auth/callback/google",
      },
    }

    mockGetProviders.mockResolvedValue(mockProviders)

    render(<SignIn />)

    await waitFor(() => {
      expect(screen.getByText("Welcome back")).toBeInTheDocument()
      expect(screen.getByText("Sign in to your productivity platform")).toBeInTheDocument()
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(screen.getByLabelText("Password")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument()
      expect(screen.getByText("Sign in with Google")).toBeInTheDocument()
    })
  })

  it("calls signIn with credentials when form is submitted", async () => {
    const user = userEvent.setup()
    
    const mockProviders = {
      credentials: {
        id: "credentials",
        name: "credentials",
        type: "credentials",
      },
      google: {
        id: "google",
        name: "Google",
        type: "oauth",
      },
    }

    mockGetProviders.mockResolvedValue(mockProviders)
    mockSignIn.mockResolvedValue({ ok: true, error: null } as any)

    render(<SignIn />)

    await waitFor(async () => {
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      const signInButton = screen.getByRole("button", { name: "Sign in" })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(signInButton)
    })

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "password123",
      redirect: false,
    })
  })

  it("calls signIn when OAuth provider button is clicked", async () => {
    const user = userEvent.setup()
    
    const mockProviders = {
      credentials: {
        id: "credentials",
        name: "credentials",
        type: "credentials",
      },
      google: {
        id: "google",
        name: "Google",
        type: "oauth",
        signinUrl: "/api/auth/signin/google",
        callbackUrl: "/api/auth/callback/google",
      },
    }

    mockGetProviders.mockResolvedValue(mockProviders)

    render(<SignIn />)

    await waitFor(async () => {
      const signInButton = screen.getByText("Sign in with Google")
      await user.click(signInButton)
    })

    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/" })
  })

  it("shows error message for invalid credentials", async () => {
    const user = userEvent.setup()
    
    const mockProviders = {
      credentials: {
        id: "credentials",
        name: "credentials",
        type: "credentials",
      },
    }

    mockGetProviders.mockResolvedValue(mockProviders)
    mockSignIn.mockResolvedValue({ ok: false, error: "CredentialsSignin" } as any)

    render(<SignIn />)

    await waitFor(async () => {
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      const signInButton = screen.getByRole("button", { name: "Sign in" })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "wrongpassword")
      await user.click(signInButton)
    })

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument()
    })
  })

  it("shows validation error for empty fields", async () => {
    const user = userEvent.setup()
    
    const mockProviders = {
      credentials: {
        id: "credentials",
        name: "credentials",
        type: "credentials",
      },
    }

    mockGetProviders.mockResolvedValue(mockProviders)

    render(<SignIn />)

    await waitFor(async () => {
      const signInButton = screen.getByRole("button", { name: "Sign in" })
      await user.click(signInButton)
    })

    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields")).toBeInTheDocument()
    })
  })
})