import { describe, it, expect, beforeEach } from 'vitest'
import { useNavigationStore } from '../navigation-store'

describe('NavigationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useNavigationStore.setState({
      activeRoute: '/',
      isMobileMenuOpen: false,
      isNavigationVisible: true,
      isNavigationCollapsed: false,
    })
  })

  it('has correct initial state', () => {
    const state = useNavigationStore.getState()
    
    expect(state.activeRoute).toBe('/')
    expect(state.isMobileMenuOpen).toBe(false)
    expect(state.isNavigationVisible).toBe(true)
    expect(state.isNavigationCollapsed).toBe(false)
  })

  it('can set active route', () => {
    const { setActiveRoute } = useNavigationStore.getState()
    
    setActiveRoute('/calendar')
    
    expect(useNavigationStore.getState().activeRoute).toBe('/calendar')
  })

  it('can toggle mobile menu state', () => {
    const { toggleMobileMenu } = useNavigationStore.getState()
    
    // Initially false
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(false)
    
    // Toggle to true
    toggleMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(true)
    
    // Toggle back to false
    toggleMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(false)
  })

  it('can close mobile menu directly', () => {
    const { toggleMobileMenu, closeMobileMenu } = useNavigationStore.getState()
    
    // Open menu first
    toggleMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(true)
    
    // Close menu directly
    closeMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(false)
    
    // Calling closeMobileMenu when already closed should keep it closed
    closeMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(false)
  })

  it('can set navigation visibility', () => {
    const { setNavigationVisibility } = useNavigationStore.getState()
    
    setNavigationVisibility(false)
    
    expect(useNavigationStore.getState().isNavigationVisible).toBe(false)
    
    setNavigationVisibility(true)
    
    expect(useNavigationStore.getState().isNavigationVisible).toBe(true)
  })

  it('maintains state consistency', () => {
    const { setActiveRoute, toggleMobileMenu, setNavigationVisibility, setNavigationCollapsed } = useNavigationStore.getState()
    
    setActiveRoute('/ai')
    toggleMobileMenu()
    setNavigationVisibility(false)
    setNavigationCollapsed(true)
    
    const state = useNavigationStore.getState()
    expect(state.activeRoute).toBe('/ai')
    expect(state.isMobileMenuOpen).toBe(true)
    expect(state.isNavigationVisible).toBe(false)
    expect(state.isNavigationCollapsed).toBe(true)
  })

  it('mobile menu actions work independently', () => {
    const { toggleMobileMenu, closeMobileMenu } = useNavigationStore.getState()
    
    // Test toggle functionality
    toggleMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(true)
    
    toggleMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(false)
    
    // Test close functionality
    toggleMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(true)
    
    closeMobileMenu()
    expect(useNavigationStore.getState().isMobileMenuOpen).toBe(false)
  })

  it('can set navigation collapsed state', () => {
    const { setNavigationCollapsed } = useNavigationStore.getState()
    
    setNavigationCollapsed(true)
    
    expect(useNavigationStore.getState().isNavigationCollapsed).toBe(true)
    
    setNavigationCollapsed(false)
    
    expect(useNavigationStore.getState().isNavigationCollapsed).toBe(false)
  })

  it('can reset navigation to initial state', () => {
    const { setActiveRoute, toggleMobileMenu, setNavigationVisibility, setNavigationCollapsed, resetNavigation } = useNavigationStore.getState()
    
    // Change all state values
    setActiveRoute('/tasks')
    toggleMobileMenu()
    setNavigationVisibility(false)
    setNavigationCollapsed(true)
    
    // Verify state is changed
    let state = useNavigationStore.getState()
    expect(state.activeRoute).toBe('/tasks')
    expect(state.isMobileMenuOpen).toBe(true)
    expect(state.isNavigationVisible).toBe(false)
    expect(state.isNavigationCollapsed).toBe(true)
    
    // Reset navigation
    resetNavigation()
    
    // Verify state is reset to initial values
    state = useNavigationStore.getState()
    expect(state.activeRoute).toBe('/')
    expect(state.isMobileMenuOpen).toBe(false)
    expect(state.isNavigationVisible).toBe(true)
    expect(state.isNavigationCollapsed).toBe(false)
  })

  it('supports horizontal navigation patterns', () => {
    const { setActiveRoute, setNavigationCollapsed } = useNavigationStore.getState()
    
    // Test navigation between horizontal menu items
    const routes = ['/', '/tasks', '/calendar', '/mail', '/ai']
    
    routes.forEach(route => {
      setActiveRoute(route)
      expect(useNavigationStore.getState().activeRoute).toBe(route)
    })
    
    // Test collapsed state for responsive design
    setNavigationCollapsed(true)
    expect(useNavigationStore.getState().isNavigationCollapsed).toBe(true)
    
    // Ensure mobile menu can still work when collapsed
    const { toggleMobileMenu } = useNavigationStore.getState()
    toggleMobileMenu()
    
    const state = useNavigationStore.getState()
    expect(state.isNavigationCollapsed).toBe(true)
    expect(state.isMobileMenuOpen).toBe(true)
  })
})