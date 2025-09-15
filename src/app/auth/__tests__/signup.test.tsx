import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import SignUp from '../signup/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

const mockPush = jest.fn()
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('SignUp Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRouter.mockReturnValue({
      push: mockPush,
    } as any)
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should render signup form', () => {
    render(<SignUp />)
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    render(<SignUp />)
    
    const submitButton = screen.getByRole('button', { name: 'Create account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('should show error when passwords do not match', async () => {
    render(<SignUp />)
    
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'TestPassword123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'DifferentPassword123' }
    })

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('should submit form successfully and redirect', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'User created successfully',
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      }),
    })

    render(<SignUp />)
    
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'TestPassword123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'TestPassword123' }
    })

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin?message=Registration successful! Please sign in.')
    })
  })

  it('should show server error messages', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'User with this email already exists'
      }),
    })

    render(<SignUp />)
    
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'TestPassword123' }
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'TestPassword123' }
    })

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('User with this email already exists')).toBeInTheDocument()
    })
  })

  it('should clear errors when user starts typing', async () => {
    render(<SignUp />)
    
    const submitButton = screen.getByRole('button', { name: 'Create account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })

    // Start typing in name field
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'J' }
    })

    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })
  })
})