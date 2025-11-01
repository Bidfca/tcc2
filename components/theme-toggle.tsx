/**
 * Theme Toggle Component for Light/Dark Mode Switching
 * 
 * This component provides a toggle button for switching between light and dark themes
 * in the AgroInsight application. It uses next-themes for theme management.
 * 
 * Key features:
 * - Smooth icon transitions between sun and moon
 * - Prevents hydration mismatch with mounted state
 * - Accessible with proper ARIA labels
 * - System theme detection as default
 * - Hover effects and responsive styling
 * 
 * Usage:
 * ```tsx
 * import { ThemeToggle } from '@/components/theme-toggle'
 * 
 * <ThemeToggle />
 * ```
 */

'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

/**
 * Theme toggle button component
 * 
 * Handles theme switching between light and dark modes with smooth transitions.
 * Uses mounted state to prevent hydration mismatch between server and client.
 */
export function ThemeToggle() {
  // Get current theme and setter function from next-themes
  const { theme, setTheme } = useTheme()
  
  // Track if component is mounted to prevent hydration mismatch
  // Theme is only available on client side, so we need to wait for mount
  const [mounted, setMounted] = React.useState(false)

  // Set mounted state after component mounts
  // This prevents SSR/client hydration mismatch errors
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Show disabled placeholder button before mounting
  // This ensures consistent rendering between server and client
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md w-9 h-9 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        disabled
      >
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  // Active toggle button with theme switching functionality
  return (
    <button
      type="button"
      // Toggle between light and dark themes
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      // Accessibility attributes
      aria-label="Alternar tema"
      title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
      // Styling with hover effects and theme-aware colors
      className="inline-flex items-center justify-center rounded-md w-9 h-9 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
    >
      {/* Sun icon - visible in light mode, rotates/scales out in dark mode */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      
      {/* Moon icon - hidden in light mode, rotates/scales in in dark mode */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      
      {/* Screen reader only text for accessibility */}
      <span className="sr-only">Alternar tema</span>
    </button>
  )
}






