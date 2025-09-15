import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SignUp from '../signup/page'
import AuthError from '../error/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('Auth Pages Layout Integration', () => {
  it('SignUp page uses correct layout classes for navigation integration', () => {
    const { container } = render(<SignUp />)
    
    // Check that the page uses the correct height calculation for navigation
    const layoutContainer = container.querySelector('[class*="min-h-[calc(100vh-4rem)]"]')
    expect(layoutContainer).toBeTruthy()
  })

  it('AuthError page uses correct layout classes for navigation integration', () => {
    const { container } = render(<AuthError />)
    
    // Check that the page uses the correct height calculation for navigation
    const layoutContainer = container.querySelector('[class*="min-h-[calc(100vh-4rem)]"]')
    expect(layoutContainer).toBeTruthy()
  })

  it('Auth pages use theme-aware background colors', () => {
    const { container } = render(<SignUp />)
    
    // Check that pages use muted background instead of hardcoded gray-50
    const bgContainer = container.querySelector('[class*="bg-muted/30"]')
    expect(bgContainer).toBeTruthy()
  })

  it('Auth pages use semantic color tokens for text', () => {
    const { container } = render(<SignUp />)
    
    // Check that pages use semantic color tokens
    const mutedText = container.querySelector('[class*="text-muted-foreground"]')
    const primaryLink = container.querySelector('[class*="text-primary"]')
    
    expect(mutedText).toBeTruthy()
    expect(primaryLink).toBeTruthy()
  })
})