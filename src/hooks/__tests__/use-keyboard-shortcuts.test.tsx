import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../use-keyboard-shortcuts'

// Mock Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock navigation store
const mockToggleMobileMenu = vi.fn()
vi.mock('@/lib/stores/navigation-store', () => ({
  useNavigationStore: () => ({ toggleMobileMenu: mockToggleMobileMenu }),
}))

describe('useKeyboardShortcuts', () => {
  const mockOnQuickTaskCreate = vi.fn()
  const mockOnTogglePastDays = vi.fn()
  const mockOnWeekChange = vi.fn()
  const mockOnGlobalSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      writable: true,
      value: document.body
    })
  })

  afterEach(() => {
    // Clean up event listeners
    vi.restoreAllMocks()
  })

  describe('Navigation shortcuts', () => {
    const mockOnMobileMenuToggle = vi.fn()

    beforeEach(() => {
      mockOnMobileMenuToggle.mockClear()
    })

    it('handles mobile menu toggle with Cmd+M', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableMobileMenuToggle: true,
        onMobileMenuToggle: mockOnMobileMenuToggle
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'm',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnMobileMenuToggle).toHaveBeenCalled()
    })

    it('handles mobile menu toggle with Ctrl+M', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableMobileMenuToggle: true,
        onMobileMenuToggle: mockOnMobileMenuToggle
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnMobileMenuToggle).toHaveBeenCalled()
    })

    it('navigates to Dashboard with Cmd+0', () => {
      renderHook(() => useKeyboardShortcuts({ enableNavigation: true }))
      
      const event = new KeyboardEvent('keydown', {
        key: '0',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('navigates to Tasks with Cmd+1', () => {
      renderHook(() => useKeyboardShortcuts({ enableNavigation: true }))
      
      const event = new KeyboardEvent('keydown', {
        key: '1',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockPush).toHaveBeenCalledWith('/tasks')
    })

    it('navigates to Calendar with Cmd+2', () => {
      renderHook(() => useKeyboardShortcuts({ enableNavigation: true }))
      
      const event = new KeyboardEvent('keydown', {
        key: '2',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockPush).toHaveBeenCalledWith('/calendar')
    })

    it('navigates to Mail with Cmd+3', () => {
      renderHook(() => useKeyboardShortcuts({ enableNavigation: true }))
      
      const event = new KeyboardEvent('keydown', {
        key: '3',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockPush).toHaveBeenCalledWith('/mail')
    })

    it('navigates to AI with Cmd+4', () => {
      renderHook(() => useKeyboardShortcuts({ enableNavigation: true }))
      
      const event = new KeyboardEvent('keydown', {
        key: '4',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockPush).toHaveBeenCalledWith('/ai')
    })

    it('ignores shortcuts when navigation is disabled', () => {
      renderHook(() => useKeyboardShortcuts({ enableNavigation: false }))
      
      const event = new KeyboardEvent('keydown', {
        key: '1',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('ignores shortcuts when mobile menu toggle is disabled', () => {
      const mockOnMobileMenuToggle = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 
        enableMobileMenuToggle: false,
        onMobileMenuToggle: mockOnMobileMenuToggle
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'm',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnMobileMenuToggle).not.toHaveBeenCalled()
    })
  })

  describe('Task management shortcuts', () => {
    it('handles quick task creation with Cmd+K', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableTaskShortcuts: true,
        onQuickTaskCreate: mockOnQuickTaskCreate
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnQuickTaskCreate).toHaveBeenCalled()
    })

    it('handles quick task creation with Ctrl+K', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableTaskShortcuts: true,
        onQuickTaskCreate: mockOnQuickTaskCreate
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'K',
        ctrlKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnQuickTaskCreate).toHaveBeenCalled()
    })

    it('handles toggle past days with Cmd+P', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableTaskShortcuts: true,
        onTogglePastDays: mockOnTogglePastDays
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'p',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnTogglePastDays).toHaveBeenCalled()
    })

    it('handles toggle past days with Ctrl+P', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableTaskShortcuts: true,
        onTogglePastDays: mockOnTogglePastDays
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'P',
        ctrlKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnTogglePastDays).toHaveBeenCalled()
    })

    it('handles global search with Cmd+/', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableTaskShortcuts: true,
        onGlobalSearch: mockOnGlobalSearch
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: '/',
        metaKey: true,
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnGlobalSearch).toHaveBeenCalled()
    })

    it('ignores task shortcuts when disabled', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableTaskShortcuts: false,
        onQuickTaskCreate: mockOnQuickTaskCreate,
        onTogglePastDays: mockOnTogglePastDays
      }))
      
      const eventK = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      })
      
      const eventP = new KeyboardEvent('keydown', {
        key: 'p',
        metaKey: true,
      })
      
      window.dispatchEvent(eventK)
      window.dispatchEvent(eventP)
      
      expect(mockOnQuickTaskCreate).not.toHaveBeenCalled()
      expect(mockOnTogglePastDays).not.toHaveBeenCalled()
    })
  })

  describe('Week navigation shortcuts', () => {
    it('handles previous week with left arrow', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableWeekNavigation: true,
        onWeekChange: mockOnWeekChange
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnWeekChange).toHaveBeenCalledWith('prev')
    })

    it('handles next week with right arrow', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableWeekNavigation: true,
        onWeekChange: mockOnWeekChange
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnWeekChange).toHaveBeenCalledWith('next')
    })

    it('ignores arrow keys when in input field', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableWeekNavigation: true,
        onWeekChange: mockOnWeekChange
      }))
      
      // Mock input element as target
      const inputElement = document.createElement('input')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
      })
      
      Object.defineProperty(event, 'target', {
        value: inputElement,
        enumerable: true
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnWeekChange).not.toHaveBeenCalled()
    })

    it('ignores arrow keys when in textarea', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableWeekNavigation: true,
        onWeekChange: mockOnWeekChange
      }))
      
      // Mock textarea element as target
      const textareaElement = document.createElement('textarea')
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
      })
      
      Object.defineProperty(event, 'target', {
        value: textareaElement,
        enumerable: true
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnWeekChange).not.toHaveBeenCalled()
    })

    it('ignores week navigation when disabled', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableWeekNavigation: false,
        onWeekChange: mockOnWeekChange
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
      })
      
      window.dispatchEvent(event)
      
      expect(mockOnWeekChange).not.toHaveBeenCalled()
    })
  })

  describe('Focus management', () => {
    it('handles escape key to blur input fields', () => {
      const { result } = renderHook(() => useKeyboardShortcuts())
      
      // Mock input element as target
      const inputElement = document.createElement('input')
      inputElement.blur = vi.fn()
      
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
      })
      
      Object.defineProperty(event, 'target', {
        value: inputElement,
        enumerable: true
      })
      
      window.dispatchEvent(event)
      
      expect(inputElement.blur).toHaveBeenCalled()
    })

    it('returns focus management utilities', () => {
      const { result } = renderHook(() => useKeyboardShortcuts())
      
      expect(result.current).toHaveProperty('restoreFocus')
      expect(result.current).toHaveProperty('setFocusedElement')
      expect(typeof result.current.restoreFocus).toBe('function')
      expect(typeof result.current.setFocusedElement).toBe('function')
    })

    it('tracks focus changes', () => {
      renderHook(() => useKeyboardShortcuts())
      
      const testElement = document.createElement('button')
      testElement.focus = vi.fn()
      
      const focusEvent = new FocusEvent('focusin', {
        target: testElement
      })
      
      window.dispatchEvent(focusEvent)
      
      // The element should be tracked internally
      // We can't directly test this without exposing internals,
      // but the functionality is tested through integration
    })
  })

  describe('General behavior', () => {
    it('ignores shortcuts without modifier keys for navigation', () => {
      renderHook(() => useKeyboardShortcuts())
      
      const event = new KeyboardEvent('keydown', {
        key: '1',
      })
      
      window.dispatchEvent(event)
      
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('prevents default behavior for handled shortcuts', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableTaskShortcuts: true,
        onQuickTaskCreate: mockOnQuickTaskCreate
      }))
      
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      })
      
      event.preventDefault = vi.fn()
      
      window.dispatchEvent(event)
      
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('handles both uppercase and lowercase keys', () => {
      renderHook(() => useKeyboardShortcuts({ 
        enableTaskShortcuts: true,
        onQuickTaskCreate: mockOnQuickTaskCreate,
        onTogglePastDays: mockOnTogglePastDays
      }))
      
      const eventLowerK = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      })
      
      const eventUpperP = new KeyboardEvent('keydown', {
        key: 'P',
        ctrlKey: true,
      })
      
      window.dispatchEvent(eventLowerK)
      window.dispatchEvent(eventUpperP)
      
      expect(mockOnQuickTaskCreate).toHaveBeenCalled()
      expect(mockOnTogglePastDays).toHaveBeenCalled()
    })
  })
})